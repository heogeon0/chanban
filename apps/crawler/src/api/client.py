"""chanban API 클라이언트."""

import httpx

from src.config import get_settings
from src.models.schemas import CreatePostPayload


async def create_post(payload: CreatePostPayload) -> dict:
    """chanban API에 새 토론 주제를 생성한다.

    Args:
        payload: CreatePostDto에 매핑되는 요청 바디.

    Returns:
        API 응답 JSON.
    """
    # TODO: httpx로 POST 요청
    # - URL: {CHANBAN_API_URL}/posts/create
    # - Headers: Authorization: Bearer {JWT_TOKEN}
    # - Body: payload.model_dump(exclude_none=True)
    settings = get_settings()
    _ = settings, httpx  # 사용 예정
    raise NotImplementedError
