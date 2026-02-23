"""찬반 토론 주제 자동 생성 + 다중 페르소나 토론 파이프라인."""

import argparse
import asyncio
import json
import random
from pathlib import Path

from src.analyzer.chain import analyze_article, generate_comment, generate_reply
from src.api.client import cast_vote, create_comment, create_post
from src.config import get_personas
from src.crawlers.article import fetch_article_content
from src.crawlers.comment import fetch_comments
from src.crawlers.ranking import fetch_ranking_articles
from src.models.schemas import CreatePostPayload, Persona, VoteStatus

POSTS_CACHE = Path("posts_cache.json")

# 대댓글 라운드 수 (무한루프 방지)
MAX_REPLY_ROUNDS = 2


async def _post_article(persona: Persona, article, comments) -> tuple[int, str, str]:
    """기사를 분석하고 게시글을 작성한다. (post_id, title, content) 반환."""
    result = await analyze_article(article, comments, persona)

    payload = CreatePostPayload(
        title=result.title,
        content=result.content,
        tag=result.tag,
        showCreatorOpinion=result.show_creator_opinion,
        creatorOpinion=result.creator_opinion,
    )
    resp = await create_post(payload, persona)
    post_id = resp["data"]["id"]
    print(f"  [{persona.name}] 글 작성 완료: {result.title} (id={post_id})")
    return post_id, result.title, result.content


async def _comment_and_vote(
    persona: Persona,
    post_id: int,
    title: str,
    content: str,
) -> tuple[int, str, VoteStatus]:
    """페르소나가 댓글 + 투표를 남긴다. (comment_id, comment_content, vote_status) 반환."""
    comment_result = await generate_comment(title, content, persona)

    # 투표
    await cast_vote(post_id, comment_result.vote_status, persona)
    print(f"  [{persona.name}] 투표: {comment_result.vote_status.value}")

    # 댓글
    resp = await create_comment(post_id, comment_result.content, persona)
    comment_id = resp["data"]["id"]
    print(f"  [{persona.name}] 댓글: {comment_result.content[:50]}...")

    return comment_id, comment_result.content, comment_result.vote_status


async def _reply_round(
    post_id: int,
    title: str,
    content: str,
    comment_records: list[dict],
    personas_map: dict[str, Persona],
) -> None:
    """의견이 다른 페르소나끼리 대댓글을 교환한다."""
    # 찬성/반대 그룹 분류
    agree_group = [r for r in comment_records if r["vote"] == VoteStatus.AGREE]
    disagree_group = [r for r in comment_records if r["vote"] == VoteStatus.DISAGREE]

    # 의견이 다른 조합 생성: 반대 그룹이 찬성 댓글에 대댓글, 또는 그 반대
    pairs = []
    for a in agree_group:
        for d in disagree_group:
            pairs.append((d, a))  # 반대측이 찬성 댓글에 대댓글
            pairs.append((a, d))  # 찬성측이 반대 댓글에 대댓글

    # 너무 많으면 랜덤 샘플링 (최대 4개)
    if len(pairs) > 4:
        pairs = random.sample(pairs, 4)

    for replier_record, target_record in pairs:
        replier = personas_map[replier_record["persona_name"]]
        reply_result = await generate_reply(
            title, content, target_record["comment_content"], replier
        )
        await create_comment(
            post_id, reply_result.content, replier, parent_id=target_record["comment_id"]
        )
        print(
            f"  [{replier.name}] → [{target_record['persona_name']}]에게 대댓글: "
            f"{reply_result.content[:50]}..."
        )


async def crawl_and_post(limit: int = 5, section: str | None = "politics") -> list[dict]:
    """1단계: 크롤링 → 랜덤 페르소나가 글 작성.

    Args:
        limit: 크롤링할 기사 수.
        section: 크롤링할 뉴스 섹션 (politics, economy, society 등, None=전체).

    Returns:
        생성된 게시글 정보 리스트 [{post_id, title, content, writer}].
    """
    personas = get_personas()
    articles = await fetch_ranking_articles(limit=limit, section=section)
    created_posts: list[dict] = []

    for article in articles:
        print(f"\n{'='*60}")
        print(f"기사: {article.title}")
        print(f"{'='*60}")

        article = await fetch_article_content(article)
        comments = await fetch_comments(article.url)

        # TODO: 나머지 페르소나 JWT 발급 후 랜덤 선택으로 변경
        writer = personas[0]  # 민주 고정
        post_id, post_title, post_content = await _post_article(
            writer, article, comments
        )

        created_posts.append({
            "post_id": post_id,
            "title": post_title,
            "content": post_content,
            "writer": writer,
        })

    print(f"\n1단계 완료: {len(created_posts)}개 글 작성")
    return created_posts


async def discuss(posts: list[dict]) -> None:
    """2단계: 나머지 페르소나들이 투표 + 댓글 + 대댓글 토론.

    Args:
        posts: crawl_and_post()에서 반환된 게시글 정보 리스트.
    """
    personas = get_personas()
    personas_map: dict[str, Persona] = {p.name: p for p in personas}

    for post in posts:
        post_id = post["post_id"]
        post_title = post["title"]
        post_content = post["content"]
        writer = post["writer"]

        print(f"\n{'='*60}")
        print(f"토론 시작: {post_title}")
        print(f"{'='*60}")

        # 글 작성자 외 나머지 페르소나가 댓글 + 투표
        commenters = [p for p in personas if p.name != writer.name]
        comment_records: list[dict] = []

        for persona in commenters:
            comment_id, comment_content, vote_status = await _comment_and_vote(
                persona, post_id, post_title, post_content
            )
            comment_records.append({
                "persona_name": persona.name,
                "comment_id": comment_id,
                "comment_content": comment_content,
                "vote": vote_status,
            })

        # 대댓글 라운드 (의견이 다른 페르소나끼리)
        for round_num in range(MAX_REPLY_ROUNDS):
            print(f"\n  --- 대댓글 라운드 {round_num + 1} ---")
            await _reply_round(
                post_id, post_title, post_content, comment_records, personas_map
            )

    print("\n2단계 완료: 토론 종료")


async def run_pipeline(limit: int = 5, section: str | None = "politics") -> None:
    """전체 파이프라인: 1단계(크롤링+글작성) → 2단계(토론)."""
    posts = await crawl_and_post(limit=limit, section=section)
    await discuss(posts)
    print("\n파이프라인 완료!")


def _save_posts(posts: list[dict]) -> None:
    """게시글 정보를 캐시 파일에 저장한다 (discuss 단독 실행용)."""
    serializable = []
    for p in posts:
        serializable.append({
            "post_id": p["post_id"],
            "title": p["title"],
            "content": p["content"],
            "writer_name": p["writer"].name,
        })
    POSTS_CACHE.write_text(json.dumps(serializable, ensure_ascii=False, indent=2))
    print(f"게시글 캐시 저장: {POSTS_CACHE}")


def _load_posts() -> list[dict]:
    """캐시 파일에서 게시글 정보를 불러온다."""
    if not POSTS_CACHE.exists():
        raise FileNotFoundError(
            f"{POSTS_CACHE} 파일이 없습니다. 먼저 'make crawl'을 실행하세요."
        )
    data = json.loads(POSTS_CACHE.read_text())
    personas = get_personas()
    personas_map = {p.name: p for p in personas}
    posts = []
    for d in data:
        posts.append({
            "post_id": d["post_id"],
            "title": d["title"],
            "content": d["content"],
            "writer": personas_map.get(d["writer_name"], personas[0]),
        })
    return posts


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
        "--limit", type=int, default=5, help="크롤링할 기사 수 (default: 5)",
    )
    parser.add_argument(
        "--section",
        default="politics",
        choices=["politics", "economy", "society", "entertainment", "technology", "all"],
        help="크롤링할 뉴스 섹션 (default: politics)",
    )
    args = parser.parse_args()
    section = None if args.section == "all" else args.section

    if args.step == "crawl":
        posts = asyncio.run(crawl_and_post(limit=args.limit, section=section))
        _save_posts(posts)
    elif args.step == "discuss":
        posts = _load_posts()
        asyncio.run(discuss(posts))
    else:
        asyncio.run(run_pipeline(limit=args.limit, section=section))


if __name__ == "__main__":
    main()
