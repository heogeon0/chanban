"""기사 URL에서 댓글 목록을 수집한다."""

from src.models.schemas import Comment


async def fetch_comments(article_url: str, limit: int = 30) -> list[Comment]:
    """기사 URL로부터 댓글을 수집한다.

    Args:
        article_url: 네이버 뉴스 기사 URL.
        limit: 수집할 최대 댓글 수.

    Returns:
        Comment 목록.
    """
    # TODO: 네이버 뉴스 댓글 API 호출
    # - 공감/비공감 수 포함하여 수집
    # - 정렬: 공감순
    raise NotImplementedError
