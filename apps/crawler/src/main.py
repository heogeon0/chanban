"""찬반 토론 주제 자동 생성 + AI 페르소나 자율 선발 토론 파이프라인."""

import argparse
import asyncio
import json
import logging
import random
from pathlib import Path

from src.analyzer.chain import (
    analyze_article,
    generate_comment,
    generate_reply,
    select_personas,
)
from src.api.client import cast_vote, create_comment, create_post, get_post
from src.config import get_personas
from src.crawlers.community import ClienFetcher, RuliwebFetcher
from src.models.schemas import Article, CommunityPost, CreatePostPayload, Persona, VoteStatus

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

POSTS_CACHE = Path("posts_cache.json")

# 처리한 URL 중복 방지 (실행 중 메모리)
_processed_urls: set[str] = set()


def _community_post_to_article(post: CommunityPost) -> Article:
    """CommunityPost를 Article로 변환한다 (analyze_article 호환)."""
    return Article(
        url=post.url,
        title=post.title,
        content=post.content,
        category=post.category,
    )


async def _post_community(
    persona: Persona,
    post: CommunityPost,
) -> tuple[int, str, str]:
    """커뮤니티 글을 분석하고 찬반 토론 게시글을 작성한다.

    Returns:
        (post_id, title, content)
    """
    article = _community_post_to_article(post)
    result = await analyze_article(article, post.comments, persona)

    payload = CreatePostPayload(
        title=result.title,
        content=result.content,
        tag=result.tag,
        showCreatorOpinion=result.show_creator_opinion,
        creatorOpinion=result.creator_opinion,
    )
    resp = await create_post(payload, persona)
    post_id = resp["data"]["id"]
    logger.info("[%s] 게시글 작성 완료: %s (id=%s)", persona.name, result.title, post_id)
    return post_id, result.title, result.content


async def _comment_and_vote(
    persona: Persona,
    post_id: int,
    title: str,
    content: str,
    existing_comments: list[str] | None = None,
) -> tuple[int, str, VoteStatus]:
    """페르소나가 댓글 + 투표를 남긴다.

    Returns:
        (comment_id, comment_content, vote_status)
    """
    comment_result = await generate_comment(title, content, persona, existing_comments)

    await cast_vote(post_id, comment_result.vote_status, persona)
    logger.info("[%s] 투표: %s", persona.name, comment_result.vote_status.value)

    resp = await create_comment(post_id, comment_result.content, persona)
    comment_id = resp["data"]["id"]
    logger.info("[%s] 댓글: %s...", persona.name, comment_result.content[:50])

    return comment_id, comment_result.content, comment_result.vote_status


async def _reply_round(
    post_id: int,
    title: str,
    content: str,
    comment_records: list[dict],
    personas_map: dict[str, Persona],
) -> None:
    """의견이 다른 페르소나끼리 대댓글을 교환한다."""
    agree_group = [r for r in comment_records if r["vote"] == VoteStatus.AGREE]
    disagree_group = [r for r in comment_records if r["vote"] == VoteStatus.DISAGREE]

    pairs = []
    for a in agree_group:
        for d in disagree_group:
            pairs.append((d, a))
            pairs.append((a, d))

    if len(pairs) > 4:
        pairs = random.sample(pairs, 4)

    for replier_record, target_record in pairs:
        replier = personas_map.get(replier_record["persona_name"])
        if not replier:
            continue
        reply_result = await generate_reply(
            title, content, target_record["comment_content"], replier
        )
        await create_comment(
            post_id, reply_result.content, replier, parent_id=target_record["comment_id"]
        )
        logger.info(
            "[%s] → [%s] 대댓글: %s...",
            replier.name, target_record["persona_name"], reply_result.content[:50],
        )


async def _process_community_post(
    community_post: CommunityPost,
    all_personas: list[Persona],
    personas_map: dict[str, Persona],
) -> dict | None:
    """커뮤니티 글 하나를 처리해 게시글 생성 + 토론을 진행한다."""
    if community_post.url in _processed_urls:
        logger.debug("중복 URL 스킵: %s", community_post.url)
        return None
    _processed_urls.add(community_post.url)

    logger.info("=" * 60)
    logger.info("[%s] %s", community_post.source, community_post.title)
    logger.info("=" * 60)

    # AI가 페르소나 자율 선발 + 찬반 가능 여부 판단
    try:
        selection = await select_personas(
            community_post.title,
            community_post.content,
            all_personas,
        )
    except Exception as e:
        logger.error("페르소나 선발 실패, 랜덤 선택으로 대체 error=%s", e)
        writer_name = random.choice(all_personas).name
        participant_names = [p.name for p in all_personas if p.name != writer_name][:3]
        reply_rounds = 2
    else:
        # controversy_level=low 주제는 찬반 토론 부적합으로 스킵
        if selection.controversy_level == "low":
            logger.info(
                "찬반 토론 부적합 주제 스킵 (controversy=low) title=%s reason=%s",
                community_post.title,
                selection.reason,
            )
            return None

        writer_name = selection.writer
        participant_names = selection.participants
        reply_rounds = selection.reply_rounds
        logger.info(
            "페르소나 선발 완료 writer=%s participants=%s controversy=%s",
            writer_name, participant_names, selection.controversy_level,
        )

    writer = personas_map.get(writer_name) or all_personas[0]
    participants = [
        personas_map[name] for name in participant_names if name in personas_map
    ]

    # 게시글 작성
    try:
        post_id, post_title, post_content = await _post_community(writer, community_post)
    except Exception as e:
        logger.error("게시글 작성 실패 title=%s error=%s", community_post.title, e)
        return None

    # 토론 진행
    comment_records: list[dict] = []
    for persona in participants:
        existing_contents = [r["comment_content"] for r in comment_records] or None
        try:
            comment_id, comment_content, vote_status = await _comment_and_vote(
                persona, post_id, post_title, post_content, existing_contents
            )
            comment_records.append({
                "persona_name": persona.name,
                "comment_id": comment_id,
                "comment_content": comment_content,
                "vote": vote_status,
            })
        except Exception as e:
            logger.warning("[%s] 댓글 실패 error=%s", persona.name, e)

    # 대댓글 라운드
    for round_num in range(reply_rounds):
        logger.info("--- 대댓글 라운드 %d ---", round_num + 1)
        try:
            await _reply_round(post_id, post_title, post_content, comment_records, personas_map)
        except Exception as e:
            logger.warning("대댓글 라운드 %d 실패 error=%s", round_num + 1, e)

    return {
        "post_id": post_id,
        "title": post_title,
        "content": post_content,
        "writer_name": writer.name,
    }


async def crawl_and_post(limit: int = 5) -> list[dict]:
    """커뮤니티 인기글 크롤링 → AI 페르소나 선발 → 게시글 생성 + 토론.

    Args:
        limit: 처리할 커뮤니티 글 수.

    Returns:
        생성된 게시글 정보 리스트.
    """
    all_personas = get_personas()
    personas_map = {p.name: p for p in all_personas}

    # 커뮤니티별 균등 분배 (low 주제 필터링을 감안해 2배 버퍼 크롤링)
    fetchers = [ClienFetcher(), RuliwebFetcher()]
    fetch_limit = limit * 2
    per_fetcher = max(1, fetch_limit // len(fetchers))
    remainder = fetch_limit - per_fetcher * len(fetchers)

    community_posts: list[CommunityPost] = []
    for i, fetcher in enumerate(fetchers):
        fetch_count = per_fetcher + (1 if i < remainder else 0)
        posts = await fetcher.fetch_hot_posts(limit=fetch_count)
        community_posts.extend(posts)

    if not community_posts:
        logger.error("수집된 커뮤니티 글이 없습니다.")
        return []

    logger.info("총 %d개 커뮤니티 글 수집 (목표: %d개 게시글 생성)", len(community_posts), limit)

    created_posts: list[dict] = []
    for community_post in community_posts:
        if len(created_posts) >= limit:
            break
        result = await _process_community_post(community_post, all_personas, personas_map)
        if result:
            created_posts.append(result)

    logger.info("파이프라인 완료: %d개 게시글 생성", len(created_posts))
    return created_posts


async def discuss(posts: list[dict]) -> None:
    """캐시된 게시글에 대해 토론을 진행한다 (discuss 단독 실행용).

    Args:
        posts: 게시글 정보 리스트 [{post_id, title, content, writer_name}].
    """
    all_personas = get_personas()
    personas_map = {p.name: p for p in all_personas}

    for post in posts:
        post_id = post["post_id"]
        post_title = post["title"]
        post_content = post["content"]
        writer_name = post.get("writer_name", all_personas[0].name)

        logger.info("=" * 60)
        logger.info("토론 재개: %s", post_title)
        logger.info("=" * 60)

        # AI가 참여 페르소나 선발
        try:
            selection = await select_personas(post_title, post_content, all_personas)
            participant_names = [
                n for n in selection.participants if n != writer_name
            ]
            reply_rounds = selection.reply_rounds
        except Exception as e:
            logger.warning("페르소나 선발 실패, 랜덤 선택 error=%s", e)
            participant_names = [p.name for p in all_personas if p.name != writer_name][:3]
            reply_rounds = 2

        participants = [personas_map[n] for n in participant_names if n in personas_map]

        comment_records: list[dict] = []
        for persona in participants:
            existing_contents = [r["comment_content"] for r in comment_records] or None
            try:
                comment_id, comment_content, vote_status = await _comment_and_vote(
                    persona, post_id, post_title, post_content, existing_contents
                )
                comment_records.append({
                    "persona_name": persona.name,
                    "comment_id": comment_id,
                    "comment_content": comment_content,
                    "vote": vote_status,
                })
            except Exception as e:
                logger.warning("[%s] 댓글 실패 error=%s", persona.name, e)

        for round_num in range(reply_rounds):
            logger.info("--- 대댓글 라운드 %d ---", round_num + 1)
            try:
                await _reply_round(
                    post_id, post_title, post_content, comment_records, personas_map
                )
            except Exception as e:
                logger.warning("대댓글 라운드 실패 error=%s", e)

    logger.info("토론 단계 완료")


def _save_posts(posts: list[dict]) -> None:
    """게시글 정보를 캐시 파일에 저장한다."""
    POSTS_CACHE.write_text(json.dumps(posts, ensure_ascii=False, indent=2))
    logger.info("게시글 캐시 저장: %s", POSTS_CACHE)


def _load_posts() -> list[dict]:
    """캐시 파일에서 게시글 정보를 불러온다."""
    if not POSTS_CACHE.exists():
        raise FileNotFoundError(
            f"{POSTS_CACHE} 파일이 없습니다. 먼저 'make crawl'을 실행하세요."
        )
    return json.loads(POSTS_CACHE.read_text())


async def _load_post_from_api(post_id: str) -> list[dict]:
    """API에서 특정 게시글을 가져와 discuss 형식으로 변환한다."""
    all_personas = get_personas()
    data = await get_post(post_id)
    post_data = data.get("data", data)
    logger.info("게시글 로드: %s (id=%s)", post_data["title"], post_id)
    return [{
        "post_id": post_id,
        "title": post_data["title"],
        "content": post_data["content"],
        "writer_name": all_personas[0].name,
    }]


def main() -> None:
    """CLI 엔트리포인트."""
    parser = argparse.ArgumentParser(description="찬반 크롤러 파이프라인")
    parser.add_argument(
        "step",
        nargs="?",
        default="all",
        choices=["all", "crawl", "discuss"],
        help="실행할 단계 (default: all)",
    )
    parser.add_argument(
        "--limit", type=int, default=5, help="처리할 게시글 수 (default: 5)",
    )
    parser.add_argument(
        "--post-id",
        help="discuss 단계에서 특정 게시글 ID 지정 (캐시 무시)",
    )
    args = parser.parse_args()

    if args.step == "crawl":
        posts = asyncio.run(crawl_and_post(limit=args.limit))
        _save_posts(posts)
    elif args.step == "discuss":
        if args.post_id:
            posts = asyncio.run(_load_post_from_api(args.post_id))
        else:
            posts = _load_posts()
        asyncio.run(discuss(posts))
    else:
        async def _run_all():
            posts = await crawl_and_post(limit=args.limit)
            _save_posts(posts)

        asyncio.run(_run_all())


if __name__ == "__main__":
    main()
