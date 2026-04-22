"""기사 URL에서 본문 텍스트를 추출한다."""

import logging

import httpx
from bs4 import BeautifulSoup

from src.models.schemas import Article

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
}

# 네이버 뉴스 본문 영역 셀렉터 (우선순위 순)
CONTENT_SELECTORS = [
    "#dic_area",           # 일반 뉴스 본문
    "#articleBody",        # 구형 뉴스 본문
    "#newsct_article",     # 뉴스 컨텐츠 영역
    ".newsct_article",     # 대체 셀렉터
]


async def fetch_article_content(article: Article) -> Article:
    """기사 URL로부터 본문 텍스트를 크롤링하여 Article.content를 채운다.

    Args:
        article: url이 설정된 Article 객체.

    Returns:
        content가 채워진 새 Article.
    """
    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=30) as client:
            resp = await client.get(article.url)
            resp.raise_for_status()
    except httpx.HTTPError as e:
        logger.warning("기사 본문 요청 실패 url=%s error=%s", article.url, e)
        return article

    soup = BeautifulSoup(resp.text, "html.parser")
    content = _extract_content(soup)

    if not content:
        logger.warning("본문 추출 실패 url=%s", article.url)

    return article.model_copy(update={"content": content})


def _extract_content(soup: BeautifulSoup) -> str:
    """HTML에서 기사 본문 텍스트를 추출한다."""
    for selector in CONTENT_SELECTORS:
        element = soup.select_one(selector)
        if element:
            for tag in element.find_all(["script", "style", "span", "a"]):
                tag.decompose()
            text = element.get_text(separator="\n", strip=True)
            if len(text) > 50:
                return text

    return ""
