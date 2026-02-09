"""LangChain 프롬프트 템플릿 정의."""

from langchain_core.prompts import ChatPromptTemplate

DEBATE_TOPIC_SYSTEM = """\
당신은 찬반 토론 주제를 생성하는 전문가입니다.
뉴스 기사와 댓글을 분석하여, 사람들이 활발히 토론할 수 있는 주제를 만들어 주세요.

규칙:
- 제목은 질문 형태로 작성 (예: "~해야 하는가?", "~은 옳은가?")
- 제목은 100자 이내
- 본문은 기사 요약 + 찬성/반대 논점을 포함
- 태그는 다음 중 하나: politics, society, economy, technology, entertainment, sports, other
"""

DEBATE_TOPIC_HUMAN = """\
## 기사 제목
{article_title}

## 기사 본문
{article_content}

## 주요 댓글
{comments}

위 기사와 댓글을 분석하여 찬반 토론 주제를 생성해 주세요.
JSON 형식으로 응답해 주세요:
{{"title": "...", "content": "...", "tag": "..."}}
"""

debate_topic_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", DEBATE_TOPIC_SYSTEM),
        ("human", DEBATE_TOPIC_HUMAN),
    ]
)
