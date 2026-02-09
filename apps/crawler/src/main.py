"""찬반 토론 주제 자동 생성 파이프라인 엔트리포인트."""

import asyncio

from src.api.client import create_post
from src.crawlers.article import fetch_article_content
from src.crawlers.comment import fetch_comments
from src.crawlers.ranking import fetch_ranking_articles
from src.analyzer.chain import analyze_article
from src.models.schemas import CreatePostPayload


async def run_pipeline() -> None:
    """전체 파이프라인을 실행한다.

    1. 네이버 뉴스 랭킹에서 인기 기사 수집
    2. 각 기사 본문 크롤링
    3. 각 기사 댓글 수집
    4. LangChain으로 찬반 토론 주제 생성
    5. chanban API로 토론 주제 등록
    """
    # Step 1: 랭킹 기사 수집
    articles = await fetch_ranking_articles(limit=5)

    for article in articles:
        # Step 2: 기사 본문 크롤링
        article = await fetch_article_content(article)

        # Step 3: 댓글 수집
        comments = await fetch_comments(article.url)

        # Step 4: LangChain 분석
        result = await analyze_article(article, comments)

        # Step 5: API 호출
        payload = CreatePostPayload(
            title=result.title,
            content=result.content,
            tag=result.tag,
            showCreatorOpinion=result.show_creator_opinion,
            creatorOpinion=result.creator_opinion,
        )
        await create_post(payload)


def main() -> None:
    """동기 엔트리포인트."""
    asyncio.run(run_pipeline())


if __name__ == "__main__":
    main()
