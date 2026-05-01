# Crawler 코드 분석 리포트

> 분석일: 2026-03-30

---

## 개요

**프로젝트명**: `chanban-crawler`

네이버 뉴스 랭킹을 크롤링 → LangChain + Google Gemini로 분석 → 토론 게시글 생성 → 다중 페르소나가 댓글/투표/대댓글로 토론을 시뮬레이션하는 자동화 파이프라인.

**기술 스택**
- Python 3.12+
- LangChain 0.3+ / Google Gemini 2.5 Flash Lite
- BeautifulSoup4, httpx, Pydantic, AsyncIO

---

## 아키텍처

3단계 파이프라인 구조.

```
[Stage 1] CRAWL & POST
  네이버 뉴스 랭킹 → 기사 본문 크롤링 → 댓글 수집
  → LangChain/Gemini 분석 → 토론 게시글 생성 (API POST)

[Stage 2] DISCUSS
  게시글별로:
    - 각 페르소나 → 댓글 생성 + 투표
    - 반대 입장 페르소나끼리 → 대댓글 교환 (최대 2라운드)

[Orchestration]
  all   = Stage 1 + Stage 2
  crawl = Stage 1만
  discuss = Stage 2만 (캐시 또는 API에서 로드)
```

---

## 파일별 분석

### `src/config.py` — 설정 & 페르소나

**Settings** (Pydantic BaseSettings)
- `.env`에서 로드
- 필수: `GOOGLE_API_KEY`, 페르소나별 JWT 토큰 5개
- 기본 API URL: `http://localhost:3001/api`

**페르소나 레지스트리** (싱글톤 패턴)

| 이름 | 연령/성별 | 성향 | 특징 |
|------|----------|------|------|
| 민주 | 40대 남성 | 진보 / 민주당 지지 | 평등·복지 중시 |
| 국힘 | 50대 남성 | 보수 / 국민의힘 지지 | 경제·안보 중시 |
| 중도 | 30대 여성 | 무당층 / 실용주의 | 데이터 기반 |
| MZ | 20대 남성 | MZ세대 | 공정성·반연고주의 |
| 어르신 | 60대 여성 | 전통 보수 | 안보·안정 중시 |

각 페르소나는 `system_prompt`를 가지며, 이 프롬프트가 LLM 응답 방향을 결정한다.

---

### `src/models/schemas.py` — 데이터 모델

| 모델 | 역할 |
|------|------|
| `PostTag` | 게시글 카테고리 (정치/사회/경제/기술/연예/스포츠/기타) |
| `VoteStatus` | 투표 결과 (agree/disagree/neutral) |
| `Persona` | 페르소나 설정 (불변) |
| `Article` | 기사 URL·제목·본문·카테고리 |
| `Comment` | 댓글 내용 + 공감/비공감 수 |
| `AnalysisResult` | LLM 분석 결과 (제목 1-100자, 본문 최소 1자 검증) |
| `CommentResult` | 댓글 생성 결과 (내용 + 투표 상태) |
| `ReplyResult` | 대댓글 생성 결과 (내용만) |
| `CreatePostPayload` | Chanban API POST /posts/create 요청 바디 |

---

### `src/crawlers/ranking.py` — 네이버 랭킹 크롤러

**`fetch_ranking_articles(limit=10, section="politics")`**

1. section명 → 네이버 섹션 ID 매핑 (100~105)
2. `https://news.naver.com/main/ranking/popularDay.naver` 요청
3. BeautifulSoup으로 `<div class="rankingnews_box">` 파싱
4. `<li>` → `<a>` 태그에서 `news.naver.com` 링크만 필터링
5. URL의 `sid` 파라미터로 카테고리 추출

**섹션 ID 매핑**

```python
"politics"      → 100
"economy"       → 101
"society"       → 102
"entertainment" → 106
"technology"    → 105
None            → 전체
```

**주의**: HTML 구조 변경 시 조용히 실패 (빈 리스트 반환).

---

### `src/crawlers/article.py` — 기사 본문 크롤러

**`fetch_article_content(article: Article)`**

본문 셀렉터 우선순위 순으로 시도:
1. `#dic_area` (최신)
2. `#articeBody` (레거시, **오타: `article`이 아닌 `artice`**)
3. `#newsct_article`
4. `.newsct_article`

script/style/span/a 태그 제거 후 텍스트 추출. 50자 미만 결과는 필터링.

---

### `src/crawlers/comment.py` — 네이버 댓글 크롤러

**`fetch_comments(article_url: str, limit=30)`**

1. URL에서 `oid`, `aid` 추출 (regex: `/article/{oid}/{aid}`)
2. object ID 구성: `news{oid},{aid}`
3. 네이버 댓글 API 호출
   - `https://apis.naver.com/commentBox/cbox/web_neo_list_jsonp.json`
   - `sort=FAVORITE` (공감순 정렬)
4. JSONP 응답 파싱 (콜백 래퍼 제거)
5. `sympathyCount` / `antipathyCount` 추출

---

### `src/analyzer/prompts.py` — LLM 프롬프트 템플릿

| 프롬프트 | 용도 | 출력 |
|---------|------|------|
| `debate_topic_prompt` | 기사 분석 → 토론 게시글 생성 | title, content, tag, creator_opinion |
| `comment_prompt` | 페르소나 댓글 생성 | content, vote_status |
| `reply_prompt` | 대댓글 생성 | content |

**공통 패턴**: 모든 프롬프트에 `{persona_description}` + `{persona_prompt}` 주입으로 페르소나 특성 유도.

토론 게시글 스타일 가이드:
- 온라인 커뮤니티 말투, 이모지/신조어 허용
- 제목 50자 이내, 본문 300-500자
- 기사 본문 3000자로 truncate (토큰 비용 절감)

---

### `src/analyzer/chain.py` — LangChain 실행

**공통 패턴**: `prompt | ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", temperature=0.7) | JsonOutputParser()`

| 함수 | 입력 | 출력 |
|------|------|------|
| `analyze_article(article, comments, persona)` | 기사 + 댓글 + 페르소나 | AnalysisResult |
| `generate_comment(title, content, persona, existing_comments)` | 게시글 + 기존 댓글 | CommentResult |
| `generate_reply(title, content, parent_comment, persona)` | 게시글 + 부모 댓글 | ReplyResult |

**existing_comments 처리**: 기존 댓글 목록을 LLM에 전달해 맥락 인지 가능하게 함. 없으면 "(아직 댓글 없음)".

---

### `src/api/client.py` — Chanban API 클라이언트

| 함수 | 메서드 | 엔드포인트 | 인증 |
|------|--------|-----------|------|
| `get_post(post_id)` | GET | `/posts/{id}` | 없음 |
| `create_post(payload, persona)` | POST | `/posts/create` | Bearer JWT |
| `cast_vote(post_id, status, persona)` | POST | `/votes` | Bearer JWT |
| `create_comment(post_id, content, persona, parent_id)` | POST | `/comments` | Bearer JWT |

---

### `src/main.py` — 오케스트레이션

**데이터 흐름**

```
[Stage 1] crawl_and_post()
  fetch_ranking_articles()
  → for each article:
      fetch_article_content()
      fetch_comments()
      analyze_article(personas[0])   ← 민주 페르소나만 작성자 (하드코딩 ⚠️)
      create_post()
  → posts_cache.json 저장

[Stage 2] discuss(posts)
  → for each post:
      for each persona (작성자 제외):
          generate_comment() + cast_vote() + create_comment()
      for round in range(MAX_REPLY_ROUNDS=2):
          _reply_round()
              agree 댓글 vs disagree 댓글 분리
              무작위 4쌍 생성 (disagree→agree, agree→disagree)
              generate_reply() → create_comment(parent_id=...)
```

**CLI 인터페이스**

```bash
python -m src.main all     --limit 5 --section politics
python -m src.main crawl   --limit 5 --section politics
python -m src.main discuss --post-id <id>  # 캐시 없이 API에서 로드
```

---

### `scripts/generate-bot-token.mjs` — JWT 토큰 생성

Node.js 스크립트. 봇 계정의 JWT 토큰을 수동 생성 (1회성).

```bash
node generate-bot-token.mjs <user_id> <kakaoId> <nickname> <jwt_secret>
```

- HMAC-SHA256 서명
- 만료: 1년
- 생성된 토큰 → `.env`의 `CHANBAN_JWT_*_TOKEN`에 등록

---

## 발견된 문제점

### Critical

| # | 문제 | 위치 | 영향 |
|---|------|------|------|
| 1 | **작성자 페르소나 하드코딩** | `main.py:122` | `personas[0]` (민주)만 게시글 작성. 나머지 4개 JWT 활용 안 됨 |
| 2 | **에러 핸들링 부재** | 전체 | 네트워크 오류, Gemini 오류, API 오류 모두 예외 전파. 재시도 로직 없음 |
| 3 | **LLM 출력 미검증** | `chain.py` | JsonOutputParser 실패 시 예외 발생. 스키마 검증 없음 |

### 주의

| # | 문제 | 위치 |
|---|------|------|
| 4 | **CSS 셀렉터 오타** | `article.py` — `#articeBody` (`article` → `artice`) |
| 5 | **Naver HTML 구조 의존성** | `ranking.py`, `article.py` — 구조 변경 시 조용히 실패 |
| 6 | **섹션 ID 하드코딩** | `ranking.py` — Naver 변경 시 breakage |
| 7 | **테스트 없음** | `tests/` — `__init__.py`만 존재 |
| 8 | **로깅 없음** | 전체 — print문만 사용 |

### 성능

| # | 문제 | 현재 | 개선 방향 |
|---|------|------|----------|
| 9 | **순차 처리** | 기사 5개 처리 ~30초+ | `asyncio.gather()` 병렬화 → ~10초 가능 |
| 10 | **httpx 클라이언트 재사용 안 됨** | 요청마다 새 클라이언트 | 공유 클라이언트 사용 권장 |

---

## 개선 제안

### 단기

```python
# 1. 작성자 페르소나 다양화
writer_persona = random.choice(personas)

# 2. 기본 에러 핸들링 + 재시도
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
async def analyze_article_with_retry(...):
    ...

# 3. 구조화된 로깅
import logging
logger = logging.getLogger(__name__)
```

### 중기

- **테스트 작성**: 파서 단위 테스트 (mock httpx), 스키마 검증 테스트
- **스케줄링**: APScheduler 또는 cron으로 주기적 자동 실행
- **병렬화**: `asyncio.gather()`로 기사 동시 처리

### 장기

- **중복 방지**: 게시글 해시로 동일 토픽 중복 생성 방지
- **Naver API 의존성 분리**: 구조 변경 대응 어댑터 패턴
- **토큰 관리**: 만료 감지 및 자동 갱신 로직

---

## 보안 고려사항

| 항목 | 현황 | 위험도 |
|------|------|--------|
| JWT 토큰 평문 저장 | `.env` 파일 | 중간 (gitignore 적용 시 낮음) |
| User-Agent 스푸핑 | Naver 봇 차단 우회 | 법적 위험 (ToS 위반 가능) |
| 직접 SQL 없음 | API 통해서만 DB 접근 | 낮음 |

---

## 의존성 요약

```toml
# 런타임
langchain >= 0.3
langchain-google-genai >= 4.0
beautifulsoup4 >= 4.12
httpx >= 0.27
pydantic >= 2.0
pydantic-settings >= 2.0

# 개발
pytest >= 8.0
pytest-asyncio >= 0.24
ruff >= 0.8
```

---

## 파일 요약표

| 파일 | 역할 | 규모 |
|------|------|------|
| `src/main.py` | 파이프라인 오케스트레이션 + CLI | ~280 LOC |
| `src/config.py` | 설정 + 페르소나 정의 | ~89 LOC |
| `src/models/schemas.py` | 데이터 모델 | ~86 LOC |
| `src/crawlers/ranking.py` | 네이버 랭킹 크롤러 | ~93 LOC |
| `src/crawlers/article.py` | 기사 본문 추출 | ~57 LOC |
| `src/crawlers/comment.py` | 댓글 API 클라이언트 | ~100 LOC |
| `src/analyzer/chain.py` | LangChain 실행 | ~137 LOC |
| `src/analyzer/prompts.py` | LLM 프롬프트 | ~132 LOC |
| `src/api/client.py` | Chanban API 클라이언트 | ~117 LOC |
| `scripts/generate-bot-token.mjs` | JWT 생성 스크립트 | ~61 LOC |
