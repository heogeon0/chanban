"""기사 URL에서 댓글 목록을 수집한다."""

import json
import re

import httpx

from src.models.schemas import Comment

COMMENT_API_URL = (
    "https://apis.naver.com/commentBox/cbox/web_neo_list_jsonp.json"
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Referer": "https://news.naver.com",
}


async def fetch_comments(article_url: str, limit: int = 30) -> list[Comment]:
    """기사 URL로부터 댓글을 수집한다.

    Args:
        article_url: 네이버 뉴스 기사 URL.
        limit: 수집할 최대 댓글 수.

    Returns:
        Comment 목록 (공감순 정렬).
    """
    oid, aid = _extract_oid_aid(article_url)
    if not oid or not aid:
        return []

    object_id = f"news{oid},{aid}"

    params = {
        "ticket": "news",
        "templateId": "default_society",
        "pool": "cbox5",
        "objectId": object_id,
        "pageSize": str(limit),
        "sort": "FAVORITE",  # 공감순
        "indexSize": "10",
        "page": "1",
        "lang": "ko",
        "country": "KR",
    }

    async with httpx.AsyncClient(headers=HEADERS, timeout=30) as client:
        resp = await client.get(COMMENT_API_URL, params=params)
        resp.raise_for_status()

    return _parse_comments(resp.text)


def _extract_oid_aid(url: str) -> tuple[str, str]:
    """기사 URL에서 언론사 ID(oid)와 기사 ID(aid)를 추출한다."""
    # n.news.naver.com/mnews/article/001/0015012345
    match = re.search(r"/article/(\d+)/(\d+)", url)
    if match:
        return match.group(1), match.group(2)

    # news.naver.com/main/read.naver?oid=001&aid=0015012345
    oid_match = re.search(r"oid=(\d+)", url)
    aid_match = re.search(r"aid=(\d+)", url)
    if oid_match and aid_match:
        return oid_match.group(1), aid_match.group(1)

    return "", ""


def _parse_comments(response_text: str) -> list[Comment]:
    """JSONP 응답에서 댓글 목록을 파싱한다."""
    # JSONP 콜백 제거 → JSON 추출
    json_match = re.search(r"\((\{.*\})\)", response_text, re.DOTALL)
    if not json_match:
        return []

    data = json.loads(json_match.group(1))
    comment_list = data.get("result", {}).get("commentList", [])

    comments = []
    for item in comment_list:
        contents = item.get("contents", "")
        if not contents:
            continue
        comments.append(
            Comment(
                content=contents,
                agree_count=item.get("sympathyCount", 0),
                disagree_count=item.get("antipathyCount", 0),
            )
        )

    return comments
