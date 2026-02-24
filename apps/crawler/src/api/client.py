"""chanban API 클라이언트."""

import httpx

from src.config import get_settings
from src.models.schemas import CreatePostPayload, Persona, VoteStatus


async def get_post(post_id: str) -> dict:
    """게시글 정보를 가져온다 (인증 불필요).

    Args:
        post_id: 게시글 UUID.

    Returns:
        API 응답 JSON (id, title, content, tag 등).
    """
    settings = get_settings()
    url = f"{settings.CHANBAN_API_URL}/posts/{post_id}"

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url)
        resp.raise_for_status()

    return resp.json()


async def create_post(payload: CreatePostPayload, persona: Persona) -> dict:
    """chanban API에 특정 페르소나로 새 토론 주제를 생성한다.

    Args:
        payload: CreatePostDto에 매핑되는 요청 바디.
        persona: 글을 작성할 봇 페르소나 (JWT 토큰 포함).

    Returns:
        API 응답 JSON.
    """
    settings = get_settings()
    url = f"{settings.CHANBAN_API_URL}/posts/create"

    headers = {
        "Authorization": f"Bearer {persona.jwt_token}",
        "Content-Type": "application/json",
    }

    body = payload.model_dump(exclude_none=True)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=body, headers=headers)
        resp.raise_for_status()

    return resp.json()


async def cast_vote(post_id: int, status: VoteStatus, persona: Persona) -> dict:
    """특정 페르소나로 게시글에 투표한다.

    Args:
        post_id: 투표 대상 게시글 ID.
        status: 투표 상태 (agree/disagree/neutral).
        persona: 투표할 봇 페르소나 (JWT 토큰 포함).

    Returns:
        API 응답 JSON.
    """
    settings = get_settings()
    url = f"{settings.CHANBAN_API_URL}/votes"

    headers = {
        "Authorization": f"Bearer {persona.jwt_token}",
        "Content-Type": "application/json",
    }

    body = {"postId": post_id, "status": status.value}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=body, headers=headers)
        resp.raise_for_status()

    return resp.json()


async def create_comment(
    post_id: int,
    content: str,
    persona: Persona,
    parent_id: int | None = None,
) -> dict:
    """특정 페르소나로 게시글에 댓글(또는 대댓글)을 작성한다.

    Args:
        post_id: 댓글 대상 게시글 ID.
        content: 댓글 내용.
        persona: 댓글을 작성할 봇 페르소나 (JWT 토큰 포함).
        parent_id: 대댓글인 경우 부모 댓글 ID.

    Returns:
        API 응답 JSON.
    """
    settings = get_settings()
    url = f"{settings.CHANBAN_API_URL}/comments"

    headers = {
        "Authorization": f"Bearer {persona.jwt_token}",
        "Content-Type": "application/json",
    }

    body: dict = {"postId": post_id, "content": content}
    if parent_id is not None:
        body["parentId"] = parent_id

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, json=body, headers=headers)
        resp.raise_for_status()

    return resp.json()
