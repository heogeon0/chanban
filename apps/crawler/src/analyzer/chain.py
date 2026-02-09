"""LangChain 체인: 기사 + 댓글 → 찬반 토론 주제 생성."""

from src.analyzer.prompts import debate_topic_prompt
from src.models.schemas import AnalysisResult, Article, Comment


async def analyze_article(
    article: Article,
    comments: list[Comment],
) -> AnalysisResult:
    """기사와 댓글을 분석하여 찬반 토론 주제를 생성한다.

    Args:
        article: 본문이 포함된 Article.
        comments: 해당 기사의 Comment 목록.

    Returns:
        AnalysisResult (title, content, tag).
    """
    # TODO: LangChain 체인 구성
    # 1. ChatOpenAI 모델 초기화
    # 2. debate_topic_prompt | model | JsonOutputParser 체인 구성
    # 3. 체인 실행 및 AnalysisResult 반환
    _ = debate_topic_prompt  # 사용 예정
    raise NotImplementedError
