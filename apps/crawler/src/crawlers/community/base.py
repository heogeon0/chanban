"""커뮤니티 크롤러 공통 인터페이스."""

from abc import ABC, abstractmethod

import httpx

from src.models.schemas import CommunityPost

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9",
}


class BaseCommunityFetcher(ABC):
    """커뮤니티 크롤러 추상 베이스 클래스."""

    source: str  # 서브클래스에서 정의 ("clien", "ruliweb" 등)

    async def fetch_hot_posts(self, limit: int = 5) -> list[CommunityPost]:
        """인기글 목록을 가져온다.

        Args:
            limit: 가져올 최대 게시글 수.

        Returns:
            CommunityPost 목록.
        """
        return await self._fetch_hot_posts(limit)

    @abstractmethod
    async def _fetch_hot_posts(self, limit: int) -> list[CommunityPost]:
        """각 커뮤니티별 인기글 수집 구현체."""
        ...

    async def _get(self, url: str, **kwargs) -> httpx.Response:
        """공통 HTTP GET 요청."""
        async with httpx.AsyncClient(headers=HEADERS, timeout=30, follow_redirects=True) as client:
            resp = await client.get(url, **kwargs)
            resp.raise_for_status()
        return resp
