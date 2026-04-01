"""LangChain 체인: 기사 + 댓글 → 찬반 토론 주제 생성."""

from langchain_google_genai import ChatGoogleGenerativeAI

from src.analyzer.prompts import comment_prompt, debate_topic_prompt, reply_prompt
from src.config import get_settings
from src.models.schemas import (
    AnalysisLLMOutput,
    AnalysisResult,
    Article,
    Comment,
    CommentResult,
    Persona,
    ReplyResult,
)


def _format_comments(comments: list[Comment]) -> str:
    """댓글 목록을 프롬프트에 넣을 문자열로 변환한다."""
    if not comments:
        return "(댓글 없음)"
    lines = []
    for c in comments:
        lines.append(f"- [공감 {c.agree_count} / 비공감 {c.disagree_count}] {c.content}")
    return "\n".join(lines)


async def analyze_article(
    article: Article,
    comments: list[Comment],
    persona: Persona,
) -> AnalysisResult:
    """기사와 댓글을 분석하여 페르소나 관점의 찬반 토론 주제를 생성한다.

    Args:
        article: 본문이 포함된 Article.
        comments: 해당 기사의 Comment 목록.
        persona: 글을 작성할 봇 페르소나.

    Returns:
        AnalysisResult (title, content, tag, creator_opinion).
    """
    settings = get_settings()

    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        temperature=0.7,
        google_api_key=settings.GOOGLE_API_KEY,
    )

    chain = debate_topic_prompt | model.with_structured_output(AnalysisLLMOutput)

    llm_output: AnalysisLLMOutput = await chain.ainvoke({
        "persona_description": persona.description,
        "persona_prompt": persona.system_prompt,
        "article_title": article.title,
        "article_content": article.content[:3000],  # 토큰 절약
        "comments": _format_comments(comments),
    })

    return AnalysisResult(
        title=llm_output.title,
        content=llm_output.content,
        tag=llm_output.tag,
        creator_opinion=llm_output.creator_opinion,
    )


def _build_model():
    """Gemini 모델 인스턴스를 생성한다."""
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        temperature=0.7,
        google_api_key=settings.GOOGLE_API_KEY,
    )


async def generate_comment(
    title: str,
    content: str,
    persona: Persona,
    existing_comments: list[str] | None = None,
) -> CommentResult:
    """게시글을 읽고 페르소나 관점의 댓글 + 투표를 생성한다.

    Args:
        title: 게시글 제목.
        content: 게시글 본문.
        persona: 댓글을 작성할 봇 페르소나.
        existing_comments: 이미 달린 댓글 목록 (다른 페르소나들의 댓글).

    Returns:
        CommentResult (content, vote_status).
    """
    
    chain = comment_prompt | _build_model().with_structured_output(CommentResult)

    if existing_comments:
        formatted = "\n".join(f"- {c}" for c in existing_comments)
    else:
        formatted = "(아직 댓글 없음)"

    result: CommentResult = await chain.ainvoke({
        "persona_description": persona.description,
        "persona_prompt": persona.system_prompt,
        "post_title": title,
        "post_content": content[:3000],
        "existing_comments": formatted,
    })

    return result


async def generate_reply(
    title: str,
    content: str,
    parent_comment: str,
    persona: Persona,
) -> ReplyResult:
    """상대 댓글에 대한 페르소나 관점의 대댓글을 생성한다.

    Args:
        title: 게시글 제목.
        content: 게시글 본문.
        parent_comment: 대댓글 대상 댓글 내용.
        persona: 대댓글을 작성할 봇 페르소나.

    Returns:
        ReplyResult (content).
    """
    chain = reply_prompt | _build_model().with_structured_output(ReplyResult)

    result: ReplyResult = await chain.ainvoke({
        "persona_description": persona.description,
        "persona_prompt": persona.system_prompt,
        "post_title": title,
        "post_content": content[:3000],
        "parent_comment": parent_comment,
    })

    return result
