"""네이버 뉴스 랭킹 페이지에서 댓글 많은 인기 기사 URL을 수집한다."""

import httpx
from bs4 import BeautifulSoup

from src.models.schemas import Article

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
    # 섹션 이름 → 네이버 섹션 ID 역매핑
    section_id_map = {v: k for k, v in SECTION_MAP.items()}
    sid = section_id_map.get(section) if section else None

    articles: list[Article] = []
    url = RANKING_URL
    if sid:
        url = f"{RANKING_URL}?sid={sid}"

    async with httpx.AsyncClient(headers=HEADERS, timeout=30) as client:
        resp = await client.get(url)
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    boxes = soup.find_all("div", class_="rankingnews_box")

    for box in boxes:
        # 언론사별 뉴스 그룹에서 기사 추출
        news_list = box.find_all("li")
        for li in news_list:
            if len(articles) >= limit:
                break

            a_tag = li.find("a")
            if not a_tag or not a_tag.get("href"):
                continue

            link = a_tag["href"]
            title = a_tag.get_text(strip=True)

            # 네이버 뉴스 링크만 수집 (n.news.naver.com)
            if "news.naver.com" not in link:
                continue

            # URL에서 섹션 ID 추출하여 카테고리 매핑
            category = _extract_category(link)

            articles.append(
                Article(url=link, title=title, category=category)
            )

        if len(articles) >= limit:
            break

    return articles[:limit]


def _extract_category(url: str) -> str:
    """기사 URL에서 카테고리를 추출한다."""
    for section_id, tag in SECTION_MAP.items():
        if f"sid={section_id}" in url or f"sid1={section_id}" in url:
            return tag
    return "other"
