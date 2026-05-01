"""네이버 뉴스 랭킹 페이지에서 댓글 많은 인기 기사 URL을 수집한다."""

import logging

import httpx
from bs4 import BeautifulSoup

from src.models.schemas import Article

logger = logging.getLogger(__name__)

RANKING_URL = "https://news.naver.com/main/ranking/popularDay.naver"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
}

SECTION_MAP = {
    "100": "politics",
    "101": "economy",
    "102": "society",
    "103": "entertainment",
    "104": "other",
    "105": "technology",
}


async def fetch_ranking_articles(
    limit: int = 10, section: str | None = "politics"
) -> list[Article]:
    """네이버 뉴스 랭킹에서 인기 기사 목록을 가져온다.

    Args:
        limit: 가져올 기사 수.
        section: 필터할 섹션 (politics, economy, society, entertainment, technology, None=전체).

    Returns:
        Article 목록 (url, title, category 포함, content는 비어 있음).
    """
    section_id_map = {v: k for k, v in SECTION_MAP.items()}
    sid = section_id_map.get(section) if section else None

    url = RANKING_URL
    if sid:
        url = f"{RANKING_URL}?sid={sid}"

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=30) as client:
            resp = await client.get(url)
            resp.raise_for_status()
    except httpx.HTTPError as e:
        logger.error("네이버 랭킹 요청 실패 url=%s error=%s", url, e)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    boxes = soup.find_all("div", class_="rankingnews_box")

    if not boxes:
        logger.warning("랭킹 박스를 찾지 못했습니다. 네이버 HTML 구조가 변경되었을 수 있습니다.")

    articles: list[Article] = []
    for box in boxes:
        news_list = box.find_all("li")
        for li in news_list:
            if len(articles) >= limit:
                break

            a_tag = li.find("a")
            if not a_tag or not a_tag.get("href"):
                continue

            link = a_tag["href"]
            title = a_tag.get_text(strip=True)

            if "news.naver.com" not in link:
                continue

            category = _extract_category(link)
            articles.append(Article(url=link, title=title, category=category))

        if len(articles) >= limit:
            break

    logger.info("네이버 랭킹 기사 %d개 수집 완료", len(articles))
    return articles[:limit]


def _extract_category(url: str) -> str:
    """기사 URL에서 카테고리를 추출한다."""
    for section_id, tag in SECTION_MAP.items():
        if f"sid={section_id}" in url or f"sid1={section_id}" in url:
            return tag
    return "other"
