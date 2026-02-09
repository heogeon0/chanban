"""네이버 뉴스 랭킹 페이지에서 댓글 많은 인기 기사 URL을 수집한다."""

from src.models.schemas import Article


async def fetch_ranking_articles(limit: int = 10) -> list[Article]:
    """네이버 뉴스 랭킹에서 인기 기사 목록을 가져온다.

    Args:
        limit: 가져올 기사 수.

    Returns:
        Article 목록 (url, title, category 포함, content는 비어 있음).
    """
    # TODO: httpx + BeautifulSoup으로 네이버 뉴스 랭킹 크롤링
    # - 댓글 많은 뉴스 탭 접근
    # - 카테고리별 인기 기사 URL 파싱
    raise NotImplementedError
