"""루리웹 BEST 인기글 크롤러."""

import logging
import re

from bs4 import BeautifulSoup

from src.crawlers.community.base import BaseCommunityFetcher
from src.models.schemas import Comment, CommunityPost

logger = logging.getLogger(__name__)

# 루리웹 실시간 BEST
HOT_POSTS_URL = "https://bbs.ruliweb.com/best"
BASE_URL = "https://bbs.ruliweb.com"


class RuliwebFetcher(BaseCommunityFetcher):
    """루리웹 BEST 인기글 크롤러."""

    source = "ruliweb"

    async def _fetch_hot_posts(self, limit: int) -> list[CommunityPost]:
        logger.info("루리웹 인기글 수집 시작 limit=%d", limit)

        try:
            resp = await self._get(HOT_POSTS_URL)
        except Exception as e:
            logger.error("루리웹 목록 요청 실패 error=%s", e)
            return []

        soup = BeautifulSoup(resp.text, "html.parser")
        post_links = _extract_post_links(soup, limit)

        if not post_links:
            logger.warning("루리웹 게시글 링크를 찾지 못했습니다. HTML 구조가 변경되었을 수 있습니다.")
            return []

        posts: list[CommunityPost] = []
        for url, title in post_links:
            try:
                post = await self._fetch_post(url, title)
                if post:
                    posts.append(post)
            except Exception as e:
                logger.warning("루리웹 게시글 수집 실패 url=%s error=%s", url, e)

        logger.info("루리웹 인기글 %d개 수집 완료", len(posts))
        return posts

    async def _fetch_post(self, url: str, title: str) -> CommunityPost | None:
        resp = await self._get(url)
        soup = BeautifulSoup(resp.text, "html.parser")

        content = _extract_content(soup)
        # 이미지 위주 게시글은 텍스트가 짧으므로 제목을 fallback으로 사용
        if not content:
            content = title

        comments = _extract_comments(soup)
        reaction_count = _extract_reaction_count(soup)
        category = _extract_category(url)

        return CommunityPost(
            url=url,
            title=title,
            content=content,
            comments=comments,
            source="ruliweb",
            category=category,
            reaction_count=reaction_count,
        )


def _extract_post_links(soup: BeautifulSoup, limit: int) -> list[tuple[str, str]]:
    """목록 페이지에서 게시글 링크와 제목을 추출한다."""
    results: list[tuple[str, str]] = []

    # 루리웹 BEST: tr.best_top_row 또는 tr.table_body
    rows = soup.select("tr.best_top_row") or soup.select("tr.table_body")

    for row in rows:
        if len(results) >= limit:
            break

        # 핫딜/광고 행 제외
        row_text = row.get_text()
        if "핫딜" in row_text or "광고" in row_text:
            continue

        link_tag = row.select_one("a.deco")
        if not link_tag:
            continue

        href = link_tag.get("href", "")
        if not href:
            continue

        url = href if href.startswith("http") else BASE_URL + href
        raw_title = link_tag.get_text(strip=True)

        # 앞 순위 숫자 제거: "1공공기관 차량..." → "공공기관 차량..."
        title = re.sub(r"^\d+", "", raw_title).strip()
        # 뒤 댓글수 제거: "제목(140)" → "제목"
        title = re.sub(r"\(\d+\)$", "", title).strip()

        if title:
            results.append((url, title))

    return results


def _extract_content(soup: BeautifulSoup) -> str:
    """게시글 본문 텍스트를 추출한다."""
    element = soup.select_one("div.view_content")
    if element:
        for tag in element.find_all(["script", "style", "figure", "iframe"]):
            tag.decompose()
        # 이미지 alt 텍스트 포함 (이미지 위주 게시글 대응)
        for img in element.find_all("img"):
            alt = img.get("alt", "")
            if alt:
                img.replace_with(alt)
        text = element.get_text(separator="\n", strip=True)
        if len(text) > 3:
            return text
    return ""


def _extract_comments(soup: BeautifulSoup) -> list[Comment]:
    """댓글 목록을 추출한다.

    루리웹 댓글은 div.text_wrapper 안에 있고,
    첫 번째는 BEST 댓글, 이후는 일반 댓글이다.
    """
    comments: list[Comment] = []

    # 댓글 영역의 text_wrapper 추출 (본문 view_content 제외)
    comment_area = soup.select_one("div.comment_view") or soup.select_one("#comment_list")
    source = comment_area if comment_area else soup

    for wrapper in source.select("div.text_wrapper"):
        text = wrapper.get_text(strip=True)
        if not text or len(text) < 5:
            continue

        # "BEST" 접두어 제거
        text = re.sub(r"^BEST\s*", "", text).strip()

        # 추천 수: 같은 행의 span.recomd
        parent = wrapper.find_parent()
        recom_tag = parent.select_one("span.recomd") if parent else None
        agree_count = 0
        if recom_tag:
            try:
                agree_count = int(recom_tag.get_text(strip=True))
            except ValueError:
                pass

        comments.append(Comment(content=text, agree_count=agree_count))

    return comments[:20]


def _extract_reaction_count(soup: BeautifulSoup) -> int:
    """게시글 추천 수를 추출한다."""
    # span.recomd.good_high 가 게시글 본문 추천 수
    tag = soup.select_one("span.recomd.good_high")
    if tag:
        try:
            return int(tag.get_text(strip=True))
        except ValueError:
            pass
    return 0


def _extract_category(url: str) -> str:
    """게시글 URL에서 카테고리를 추론한다."""
    url_lower = url.lower()
    if any(k in url_lower for k in ["politics", "pol", "social", "society"]):
        return "politics"
    if any(k in url_lower for k in ["economy", "econ", "finance"]):
        return "economy"
    if any(k in url_lower for k in ["game", "ps", "xbox", "pc"]):
        return "technology"
    if any(k in url_lower for k in ["entertain", "movie", "drama", "idol"]):
        return "entertainment"
    if any(k in url_lower for k in ["sports", "sport", "soccer", "baseball"]):
        return "sports"
    return "other"
