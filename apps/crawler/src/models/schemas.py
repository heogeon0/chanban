from enum import Enum

from pydantic import BaseModel, Field


class PostTag(str, Enum):
    """chanban PostTag enum과 1:1 매핑."""

    POLITICS = "politics"
    SOCIETY = "society"
    ECONOMY = "economy"
    TECHNOLOGY = "technology"
    ENTERTAINMENT = "entertainment"
    SPORTS = "sports"
    OTHER = "other"


class VoteStatus(str, Enum):
    """chanban VoteStatus enum과 1:1 매핑."""

    AGREE = "agree"
    DISAGREE = "disagree"
    NEUTRAL = "neutral"


class Persona(BaseModel):
    """봇 페르소나 설정."""

    name: str
    jwt_token: str
    description: str
    system_prompt: str


class Article(BaseModel):
    """크롤링된 뉴스 기사."""

    url: str
    title: str
    content: str = ""
    category: str = ""


class Comment(BaseModel):
    """기사 댓글."""

    content: str
    agree_count: int = 0
    disagree_count: int = 0


class AnalysisResult(BaseModel):
    """LangChain 분석 결과 — 찬반 토론 주제."""

    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    tag: PostTag
    show_creator_opinion: bool = True
    creator_opinion: VoteStatus


class CommentResult(BaseModel):
    """LangChain 댓글 생성 결과."""

    content: str
    vote_status: VoteStatus


class ReplyResult(BaseModel):
    """LangChain 대댓글 생성 결과."""

    content: str


class CreatePostPayload(BaseModel):
    """chanban API POST /api/posts/create 요청 바디.

    CreatePostDto에 1:1 매핑된다.
    """

    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)
    tag: PostTag
    showCreatorOpinion: bool = True
    creatorOpinion: VoteStatus
