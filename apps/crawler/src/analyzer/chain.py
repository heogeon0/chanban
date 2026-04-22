"""LangChain 체인: 커뮤니티 글/기사 → 찬반 토론 주제 생성 + 페르소나 선발."""

import logging

from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from tenacity import retry, stop_after_attempt, wait_exponential

from src.analyzer.prompts import (
    comment_prompt,
    debate_topic_prompt,
    persona_selection_prompt,
    reply_prompt,
)
from src.config import get_settings
from src.models.schemas import (
    AnalysisResult,
    Article,
    Comment,
    CommentResult,
    Persona,
    PersonaSelectionResult,
    ReplyResult,
)

logger = logging.getLogger(__name__)


def _build_model() -> ChatGoogleGenerativeAI:
    """Gemini 모델 인스턴스를 생성한다."""
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.7,
        google_api_key=settings.GOOGLE_API_KEY,
    )


def _format_comments(comments: list[Comment]) -> str:
    """댓글 목록을 프롬프트용 문자열로 변환한다."""
    if not comments:
        return "(댓글 없음)"
    lines = [
        f"- [공감 {c.agree_count} / 비공감 {c.disagree_count}] {c.content}"
        for c in comments
    ]
    return "\n".join(lines)


def _format_persona_list(personas: list[Persona]) -> str:
    """페르소나 목록을 선발 프롬프트용 문자열로 변환한다."""
    lines = []
    for p in personas:
        tags = ", ".join(p.tags) if p.tags else "일반"
        lines.append(f"- {p.name}: {p.description} [관심사: {tags}]")
    return "\n".join(lines)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def select_personas(
    title: str,
    content: str,
    available_personas: list[Persona],
) -> PersonaSelectionResult:
    """게시글 주제를 보고 AI가 참여 페르소나를 자율 선발한다.

    Args:
        title: 게시글 제목.
        content: 게시글 본문 요약.
        available_personas: 선발 후보 페르소나 목록.

    Returns:
        PersonaSelectionResult (writer, participants, reply_rounds, controversy_level, reason).
    """
    chain = persona_selection_prompt | _build_model() | JsonOutputParser()

    result = await chain.ainvoke({
        "post_title": title,
        "post_summary": content[:500],
        "persona_list": _format_persona_list(available_personas),
    })

    selection = PersonaSelectionResult(**result)

    # 선발된 이름이 실제 페르소나 목록에 있는지 검증
    available_names = {p.name for p in available_personas}
    if selection.writer not in available_names:
        logger.warning("AI가 존재하지 않는 writer 선발: %s → 첫 번째 페르소나로 대체", selection.writer)
        selection = selection.model_copy(update={"writer": available_personas[0].name})

    valid_participants = [p for p in selection.participants if p in available_names]
    if len(valid_participants) < 2:
        fallback = [p.name for p in available_personas if p.name != selection.writer][:3]
        logger.warning("유효한 participants 부족 → fallback: %s", fallback)
        valid_participants = fallback

    selection = selection.model_copy(update={"participants": valid_participants})

    logger.info(
        "페르소나 선발 완료 writer=%s participants=%s rounds=%d controversy=%s",
        selection.writer, selection.participants, selection.reply_rounds, selection.controversy_level,
    )
    return selection


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def analyze_article(
    article: Article,
    comments: list[Comment],
    persona: Persona,
) -> AnalysisResult:
    """기사/커뮤니티 글과 댓글을 분석하여 페르소나 관점의 찬반 토론 주제를 생성한다.

    Args:
        article: 본문이 포함된 Article.
        comments: 해당 글의 Comment 목록.
        persona: 글을 작성할 봇 페르소나.

    Returns:
        AnalysisResult (title, content, tag, creator_opinion).
    """
    chain = debate_topic_prompt | _build_model() | JsonOutputParser()

    result = await chain.ainvoke({
        "persona_description": persona.description,
        "persona_prompt": persona.system_prompt,
        "article_title": article.title,
        "article_content": article.content[:3000],
        "comments": _format_comments(comments),
    })

    analysis = AnalysisResult(**result)
    logger.info("게시글 분석 완료 persona=%s title=%s", persona.name, analysis.title)
    return analysis


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
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
        existing_comments: 이미 달린 댓글 목록.

    Returns:
        CommentResult (content, vote_status).
    """
    chain = comment_prompt | _build_model() | JsonOutputParser()

    formatted = (
        "\n".join(f"- {c}" for c in existing_comments)
        if existing_comments
        else "(아직 댓글 없음)"
    )

    result = await chain.ainvoke({
        "persona_description": persona.description,
        "persona_prompt": persona.system_prompt,
        "post_title": title,
        "post_content": content[:3000],
        "existing_comments": formatted,
    })

    return CommentResult(**result)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
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
    chain = reply_prompt | _build_model() | JsonOutputParser()

    result = await chain.ainvoke({
        "persona_description": persona.description,
        "persona_prompt": persona.system_prompt,
        "post_title": title,
        "post_content": content[:3000],
        "parent_comment": parent_comment,
    })

    return ReplyResult(**result)
