"""기사 URL에서 본문 텍스트를 추출한다."""

from src.models.schemas import Article


async def fetch_article_content(article: Article) -> Article:
    """기사 URL로부터 본문 텍스트를 크롤링하여 Article.content를 채운다.

    Args:
        article: url이 설정된 Article 객체.

    Returns:
        content가 채워진 Article.
    """
    # TODO: httpx + BeautifulSoup으로 기사 본문 추출
    # - 네이버 뉴스 기사 페이지 HTML 파싱
    # - 본문 영역 선택 및 텍스트 추출
    raise NotImplementedError
