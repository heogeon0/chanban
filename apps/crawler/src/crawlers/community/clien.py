"""클리앙 '모두의공원' 인기글 크롤러."""

import logging

from bs4 import BeautifulSoup

from src.crawlers.community.base import BaseCommunityFetcher
from src.models.schemas import Comment, CommunityPost

logger = logging.getLogger(__name__)

# 클리앙 모두의공원 — 공감순 정렬
HOT_POSTS_URL = "https://www.clien.net/service/board/park?sort=symph&po=0"
BASE_URL = "https://www.clien.net"


class ClienFetcher(BaseCommunityFetcher):
    """클리앙 모두의공원 인기글 크롤러."""

    source = "clien"

    async def _fetch_hot_posts(self, limit: int) -> list[CommunityPost]:
        logger.info("클리앙 인기글 수집 시작 limit=%d", limit)

        try:
            resp = await self._get(HOT_POSTS_URL)
        except Exception as e:
            logger.error("클리앙 목록 요청 실패 error=%s", e)
            return []

        soup = BeautifulSoup(resp.text, "html.parser")
        post_links = _extract_post_links(soup, limit)

        if not post_links:
            logger.warning("클리앙 게시글 링크를 찾지 못했습니다. HTML 구조가 변경되었을 수 있습니다.")
            return []

        posts: list[CommunityPost] = []
        for url, title in post_links:
            try:
                post = await self._fetch_post(url, title)
                if post:
                    posts.append(post)
            except Exception as e:
                logger.warning("클리앙 게시글 수집 실패 url=%s error=%s", url, e)

        logger.info("클리앙 인기글 %d개 수집 완료", len(posts))
        return posts

    async def _fetch_post(self, url: str, title: str) -> CommunityPost | None:
        resp = await self._get(url)
        soup = BeautifulSoup(resp.text, "html.parser")

        content = _extract_content(soup)
        if not content:
            logger.debug("클리앙 본문 추출 실패 url=%s", url)
            return None

        comments = _extract_comments(soup)
        reaction_count = _extract_reaction_count(soup)
        category = _extract_category(soup)

        return CommunityPost(
            url=url,
            title=title,
            content=content,
            comments=comments,
            source="clien",
            category=category,
            reaction_count=reaction_count,
        )


def _extract_post_links(soup: BeautifulSoup, limit: int) -> list[tuple[str, str]]:
    """목록 페이지에서 게시글 링크와 제목을 추출한다."""
    results: list[tuple[str, str]] = []

    # 클리앙 게시글 목록: div.list_item 내 a.subject_fixed 또는 span.list_subject
    items = soup.select("div.list_item")
    if not items:
        # fallback: li.list_item
        items = soup.select("li.list_item")

    for item in items:
        if len(results) >= limit:
            break

        # 공지사항 제외
        if item.get("data-type") == "notice":
            continue

        link_tag = item.select_one("a.subject_fixed") or item.select_one("a[href*='/service/board/']")
        if not link_tag:
            continue

        href = link_tag.get("href", "")
        if not href or "/board/" not in href:
            continue

        # 공지(annonce) 및 모두의공원(park) 외 게시판 제외
        if "/annonce/" in href or "/board/park/" not in href:
            continue

        url = BASE_URL + href if href.startswith("/") else href
        title_tag = link_tag.select_one("span.list_subject") or link_tag
        title = title_tag.get_text(strip=True)

        if title:
            results.append((url, title))

    return results


def _extract_content(soup: BeautifulSoup) -> str:
    """게시글 본문 텍스트를 추출한다."""
    selectors = [
        "div.post_content",
        "article.post_article",
        "div.post_article",
        "#div_postContent",
    ]
    for selector in selectors:
        element = soup.select_one(selector)
        if element:
            for tag in element.find_all(["script", "style", "figure"]):
                tag.decompose()
            text = element.get_text(separator="\n", strip=True)
            if len(text) > 30:
                return text

    return ""


def _extract_comments(soup: BeautifulSoup) -> list[Comment]:
    """댓글 목록을 추출한다."""
    comments: list[Comment] = []

    comment_items = soup.select("div.comment_row")
    for item in comment_items:
        # 삭제된 댓글 제외
        if item.select_one(".comment_deleted"):
            continue

        content_tag = (
            item.select_one("div.comment_content_text")
            or item.select_one("p.comment_content")
            or item.select_one("div.comment_content")
        )
        if not content_tag:
            continue

        content = content_tag.get_text(strip=True)
        if not content:
            continue

        # 공감 수
        symph_tag = item.select_one("span.comment_symph") or item.select_one(".symph_count")
        agree_count = int(symph_tag.get_text(strip=True) or "0") if symph_tag else 0

        comments.append(Comment(content=content, agree_count=agree_count))

    return comments[:20]


def _extract_reaction_count(soup: BeautifulSoup) -> int:
    """게시글 공감 수를 추출한다."""
    tag = (
        soup.select_one("div.post_symph span")
        or soup.select_one("span.post_symph_count")
        or soup.select_one(".symph_count")
    )
    if tag:
        try:
            return int(tag.get_text(strip=True))
        except ValueError:
            pass
    return 0


def _extract_category(soup: BeautifulSoup) -> str:
    """게시글 카테고리를 추출한다."""
    tag = soup.select_one("span.post_category") or soup.select_one("div.post_category")
    if tag:
        text = tag.get_text(strip=True).lower()
        if any(k in text for k in ["정치", "사회", "국회"]):
            return "politics"
        if any(k in text for k in ["경제", "금융", "주식"]):
            return "economy"
        if any(k in text for k in ["기술", "it", "ai", "게임"]):
            return "technology"
        if any(k in text for k in ["연예", "방송", "스포츠"]):
            return "entertainment"
    return "other"
