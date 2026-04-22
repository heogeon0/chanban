# Crawler 고도화 계획

> 작성일: 2026-03-30
> 기반 문서: research.md

---

## 목표

**"AI가 기사를 읽고 스스로 판단해서 토론을 만든다"**

기존: 고정 5개 페르소나 → 민주 항상 작성 → 나머지 4명 항상 댓글
목표: AI가 기사 주제를 보고 → 적합한 페르소나를 선발 → 각자의 방식으로 토론

---

## 변경 개요

```
[AS-IS]
기사 → analyze(personas[0]) → 5명 전원 댓글 → 2라운드 고정 대댓글

[TO-BE]
기사 → select_personas(기사 내용) → 작성자 1명 선발 → analyze(선발된 작성자)
      → 참여자 N명 선발(2~5명) → N명 댓글 → AI가 결정한 라운드 대댓글
```

---

## 페르소나 풀 확장 설계

### 기존 5개 (정치 편향)

| 이름 | 연령/성별 | 성향 |
|------|----------|------|
| 민주 | 40대 남성 | 진보 / 민주당 |
| 국힘 | 50대 남성 | 보수 / 국민의힘 |
| 중도 | 30대 여성 | 무당층 / 실용 |
| MZ | 20대 남성 | MZ세대 |
| 어르신 | 60대 여성 | 전통 보수 |

### 추가 10개 (생활형 · 직군별)

| 이름 | 연령/성별 | 직군/특성 | 주요 관심사 |
|------|----------|----------|------------|
| 워킹맘 | 30대 여성 | 맞벌이 주부 | 교육·육아·복지 |
| 자영업자 | 40대 남성 | 소상공인 | 최저임금·임대료·세금 |
| 취준생 | 20대 여성 | 취업준비생 | 고용·청년정책·공정 |
| 직장인 | 30대 남성 | 대기업 사원 | 경제·부동산·노동 |
| 의사 | 40대 남성 | 의료전문직 | 의료정책·건강보험 |
| 교사 | 30대 여성 | 공립학교 교사 | 교육정책·입시·학생인권 |
| 농부 | 50대 남성 | 농업 종사자 | 농업정책·FTA·지방소멸 |
| 투자자 | 40대 남성 | 주식·부동산 투자 | 금리·규제·세금 |
| 대학생 | 20대 여성 | 인문계열 | 페미니즘·기후·인권 |
| 은퇴자 | 60대 남성 | 전직 공무원 | 연금·안보·질서 |

> **총 15개 페르소나**

---

## Phase 2 자동화 전략

기존 `apps/api/scripts/issue-bot-tokens.mjs`를 확장해서 **계정 생성 + JWT 발급 + .env 주입을 한 번에** 처리한다.

### 현재 스크립트 동작
```
DB 조회 (bot-crawler-001~005) → JWT 생성 → 콘솔 출력
```

### 변경 후 동작
```
DB upsert (15개 봇 계정 없으면 생성) → JWT 생성 → apps/crawler/.env 파일에 자동 기록
```

### 구체적 변경 내용

**`apps/api/scripts/issue-bot-tokens.mjs` 수정**

```js
// 1. BOT_KAKAO_IDS → BOT_PERSONAS 로 확장 (15개)
const BOT_PERSONAS = [
  { kakaoId: 'bot-crawler-minju',     nickname: '민주봇'     },
  { kakaoId: 'bot-crawler-gukhim',    nickname: '국힘봇'     },
  // ... 15개
];

// 2. SELECT → INSERT ON CONFLICT DO NOTHING (upsert)
await client.query(`
  INSERT INTO users ("kakaoId", nickname, "profileImageUrl")
  VALUES ($1, $2, NULL)
  ON CONFLICT ("kakaoId") DO NOTHING
`, [persona.kakaoId, persona.nickname]);

// 3. 결과를 콘솔 출력 대신 .env 파일에 기록
const envPath = path.resolve('../../crawler/.env');
fs.writeFileSync(envPath, envContent);
```

**실행 한 줄로 완료**
```bash
# apps/api/ 에서 실행
node scripts/issue-bot-tokens.mjs

# 또는 크롤러 Makefile에 추가
make setup-bots  # → api 스크립트 실행 후 .env 갱신
```

### 전제 조건
- `apps/api/.env`에 DB 접속 정보와 `JWT_SECRET` 필요 (이미 존재)
- `apps/crawler/.env`가 없으면 새로 생성, 있으면 기존 내용 보존 후 토큰 항목만 덮어쓰기

---

## 핵심 신규 로직: AI 페르소나 선발

### 새 Chain: `select_personas()`

기사 분석 후 AI가 다음을 결정:

```python
class PersonaSelectionResult(BaseModel):
    writer: str           # 작성자 페르소나 이름
    participants: list[str]  # 댓글 참여자 이름 (2~5명)
    reply_rounds: int     # 대댓글 라운드 수 (1~3)
    controversy_level: str  # "low" | "medium" | "high"
    reason: str           # 선발 이유 (디버깅용)
```

### 선발 기준 프롬프트 설계

```
다음 기사를 읽고, 이 주제에 가장 관심을 가질 사람들을 선발하세요.

[페르소나 목록]
- 민주 (40대 진보 남성): 평등·복지 관심
- 자영업자 (40대 소상공인): 세금·임대료 관심
...

[기사 제목]: {title}
[기사 요약]: {summary}

규칙:
1. writer: 이 주제에 대해 가장 강한 의견을 가질 1명
2. participants: 이 주제에 자연스럽게 반응할 2~5명 (writer 제외)
3. reply_rounds: 논란성이 높으면 3, 중간이면 2, 낮으면 1
4. 정치 기사라고 무조건 민주/국힘을 고르지 말 것
5. 다양한 페르소나를 골고루 활용할 것
```

---

## 크롤링 소스 전환: 뉴스 → 커뮤니티

### 왜 커뮤니티인가?

| | 뉴스 (AS-IS) | 커뮤니티 (TO-BE) |
|--|-------------|----------------|
| 콘텐츠 성격 | 사실 보도 → AI가 찬반 주제로 변환 필요 | 이미 사람들이 의견 쏟아내는 글 |
| 찬반 적합도 | 중간 (뉴스 자체는 중립적) | 높음 (커뮤니티 글은 본질적으로 논쟁 유발) |
| 댓글 활용 | 네이버 댓글 API 별도 호출 | 본문 댓글이 이미 찬반 맥락 풍부 |
| 다양성 | 정치/경제 뉴스 위주 | 생활/연애/취업/정치 등 다양 |

### 타겟 커뮤니티 (조사 결과)

| 순위 | 사이트 | 크롤링 난이도 | 콘텐츠 적합도 | 선정 이유 |
|------|--------|------------|------------|---------|
| 1순위 | **클리앙** (clien.net) | 낮음 | 높음 | 정적 HTML, 의견글 위주 "모두의공원", GitHub 크롤러 선례 多 |
| 2순위 | **루리웹** (ruliweb.com) | 낮음 | 중간 | 정적 HTML, 봇 방어 약함, 다양한 주제 |
| 3순위 | **에펨코리아** (fmkorea.com) | 중간 | 중간 | 사용자 많음, "포텐 터짐" 인기글 명확 |

> **피해야 할 곳**: 더쿠(DDoS 차단), 보배드림(Cloudflare), 디씨(robots.txt 차단)

### 아키텍처 변경

```
[AS-IS] src/crawlers/ranking.py  ← 네이버 뉴스 랭킹 전용
[TO-BE] src/crawlers/community/
          __init__.py
          base.py              ← 공통 인터페이스 (CommunityPost 모델 + fetch 추상 메서드)
          clien.py             ← 클리앙 모두의공원 인기글
          ruliweb.py           ← 루리웹 BEST
          fmkorea.py           ← 에펨코리아 포텐 터짐
```

**공통 데이터 모델**
```python
class CommunityPost(BaseModel):
    url: str
    title: str
    content: str
    comments: list[Comment]   # 기존 Comment 모델 재사용
    source: str               # "clien" | "ruliweb" | "fmkorea"
    category: str             # 게시글 카테고리 태그
    reaction_count: int       # 추천/공감 수 (인기도 판단용)
```

**LLM 파이프라인 변화**

현재는 뉴스 기사를 받아 "토론 주제로 재구성"하는 단계가 필요하지만, 커뮤니티 글은 이미 사람들의 의견이 담겨 있어서 `analyze_article()` 프롬프트가 단순해진다.

```
[AS-IS] 뉴스 본문 → "이걸 찬반 토론 주제로 만들어줘"
[TO-BE] 커뮤니티 글 + 댓글 → "이 글의 핵심 찬반 포인트를 뽑아서 토론 게시글로 만들어줘"
```

### 구현 방식

**`crawlers/community/base.py`**
```python
class BaseCommunityFetcher(ABC):
    @abstractmethod
    async def fetch_hot_posts(self, limit: int) -> list[CommunityPost]: ...
```

**`main.py` 변경**
```python
# AS-IS
articles = await fetch_ranking_articles(limit, section)

# TO-BE
from crawlers.community import ClienFetcher, RuliwebFetcher
fetchers = [ClienFetcher(), RuliwebFetcher()]
posts = []
for fetcher in fetchers:
    posts += await fetcher.fetch_hot_posts(limit // len(fetchers))
```

---

## 구현 단계

### Phase 1 — 기반 버그 수정 (빠른 작업)

**1-1. CSS 셀렉터 오타 수정**
- `crawlers/article.py`: `#articeBody` → `#articleBody`

**1-2. 에러 핸들링 기본 추가**
- `chain.py`: LLM JSON 파싱 실패 시 재시도 (최대 3회)
- `api/client.py`: 4xx/5xx 응답 시 예외 + 로그
- 크롤러: 빈 결과 반환 시 경고 로그

**1-3. 로깅 도입**
- `print()` → `logging.getLogger(__name__)`
- 레벨: DEBUG(크롤링 상세) / INFO(파이프라인 흐름) / WARNING(실패) / ERROR(치명적)

---

### Phase 2 — 페르소나 시스템 확장 (완전 자동화)

**2-1. `apps/api/scripts/issue-bot-tokens.mjs` 확장**
- 15개 봇 페르소나 정의 (kakaoId + nickname)
- `INSERT ON CONFLICT DO NOTHING`으로 계정 없으면 자동 생성
- 결과를 `apps/crawler/.env`에 직접 기록
- 기존 `.env` 내용 보존, 토큰 항목만 upsert

**2-2. `apps/crawler/Makefile`에 `setup-bots` 타겟 추가**
```makefile
setup-bots:
    cd ../api && node scripts/issue-bot-tokens.mjs
```

**2-3. 크롤러 `config.py`에 페르소나 10개 추가**
- 각 페르소나에 `tags: list[str]` 속성 추가
  - 예: `["경제", "세금", "소상공인"]` → AI 선발 힌트로 활용
- `.env.example` 업데이트

**2-4. Persona 모델 수정** (`schemas.py`)
```python
class Persona(BaseModel):
    name: str
    jwt_token: str
    description: str
    system_prompt: str
    tags: list[str]  # 추가: 관심 주제 태그
```

---

### Phase 3 — AI 자율 선발 로직 구현 (핵심)

**3-1. 새 스키마 추가** (`schemas.py`)
```python
class PersonaSelectionResult(BaseModel):
    writer: str
    participants: list[str]  # 2~5명
    reply_rounds: int        # 1~3
    controversy_level: Literal["low", "medium", "high"]
    reason: str
```

**3-2. 선발 프롬프트 작성** (`analyzer/prompts.py`)
- `persona_selection_prompt` 추가
- 페르소나 목록을 동적으로 주입 (`{persona_list}`)
- 선발 규칙 명시 (다양성 강제, 주제 연관성 기준)

**3-3. 선발 Chain 구현** (`analyzer/chain.py`)
```python
async def select_personas(
    article: Article,
    available_personas: list[Persona]
) -> PersonaSelectionResult:
    ...
```

**3-4. main.py 파이프라인 수정**

```python
# AS-IS
writer = personas[0]
analyze_article(article, comments, writer)
for persona in personas[1:]:
    _comment_and_vote(...)

# TO-BE
selection = await select_personas(article, all_personas)
writer = get_persona_by_name(selection.writer)
analyze_article(article, comments, writer)
participants = [get_persona_by_name(n) for n in selection.participants]
for persona in participants:
    _comment_and_vote(...)
# reply_rounds도 selection.reply_rounds 사용
```

---

### Phase 4 — 안정성 & 성능

**4-1. 재시도 로직** (`tenacity` 라이브러리)
```python
@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
async def analyze_article(...): ...

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
async def select_personas(...): ...
```

**4-2. 기사 병렬 처리**
```python
# AS-IS: sequential
for article in articles:
    await _post_article(...)

# TO-BE: concurrent
tasks = [_post_article(article) for article in articles]
results = await asyncio.gather(*tasks, return_exceptions=True)
```

**4-3. httpx 클라이언트 공유**
- `api/client.py`에 모듈 레벨 `AsyncClient` 싱글톤 사용
- 커넥션 풀링으로 API 호출 속도 개선

**4-4. 중복 게시글 방지**
- 기사 URL 해시를 `posts_cache.json`에 저장
- 이미 처리된 URL은 스킵

---

## 파일별 변경 범위

| 파일 | 변경 내용 | 규모 |
|------|----------|------|
| `src/crawlers/community/base.py` | 공통 인터페이스 + CommunityPost 모델 | 신규 |
| `src/crawlers/community/clien.py` | 클리앙 크롤러 | 신규 |
| `src/crawlers/community/ruliweb.py` | 루리웹 크롤러 | 신규 |
| `src/crawlers/community/fmkorea.py` | 에펨코리아 크롤러 | 신규 |
| `src/crawlers/ranking.py` | 뉴스 크롤러 → 레거시 유지 (선택적 사용) | 유지 |
| `src/config.py` | 페르소나 10개 추가, tags 속성 추가 | 대 |
| `src/models/schemas.py` | `PersonaSelectionResult`, `Persona.tags`, `CommunityPost` 추가 | 소 |
| `src/analyzer/prompts.py` | `persona_selection_prompt` 추가, `debate_topic_prompt` 커뮤니티용으로 수정 | 중 |
| `src/analyzer/chain.py` | `select_personas()` 추가, 재시도 데코레이터 | 중 |
| `src/main.py` | 커뮤니티 크롤러 연결, 선발 로직, 병렬화 | 대 |
| `src/crawlers/article.py` | 오타 수정 | 극소 |
| `src/api/client.py` | 클라이언트 공유, 에러 핸들링 | 소 |
| `.env.example` | 10개 토큰 변수 추가 | 소 |
| `apps/api/scripts/issue-bot-tokens.mjs` | 15개 봇 upsert + .env 자동 기록 | 중 |

---

## 신규 의존성

```toml
tenacity >= 8.0   # 재시도 로직
# 커뮤니티 크롤링은 기존 httpx + beautifulsoup4로 충분 (추가 의존성 없음)
```

---

## 작업 전제 조건

- [ ] `apps/api/.env`에 `JWT_SECRET`과 DB 접속 정보 세팅 (이미 존재하면 OK)
- [ ] `make setup-bots` 한 번 실행

> Phase 1은 전제 조건 없이 바로 진행 가능. Phase 2 이후는 `make setup-bots` 한 번으로 준비 완료.

---

## 예상 결과

```
[기사: "의대 증원 강행... 의사협회 강력 반발"]

AI 선발 결과:
  writer:       의사 (의료 당사자 관점에서 강한 의견)
  participants: [워킹맘, 직장인, 어르신, MZ]
  reply_rounds: 3  (controversy_level: high)
  reason: "의료 정책은 직접 이해관계자(의사)와 일반 시민 사이 갈등이 큼"

→ 의사가 게시글 작성 (의사 입장에서의 토론 주제 제시)
→ 워킹맘·직장인·어르신·MZ가 각자 입장에서 댓글
→ 3라운드 대댓글로 논쟁 심화
```

```
[기사: "손흥민 리그 통산 100골 달성"]

AI 선발 결과:
  writer:       MZ (스포츠·팬덤 관심)
  participants: [대학생, 직장인]
  reply_rounds: 1  (controversy_level: low)
  reason: "축제 분위기의 스포츠 기사, 논란 낮음"

→ 짧고 가벼운 토론
```

```
[클리앙 모두의공원: "요즘 카페 알바 시급이 너무 낮은거 아닌가요?"]
출처: clien.net | 추천 234 | 댓글 89개

AI 선발 결과:
  writer:       자영업자 (카페 사장 입장)
  participants: [취준생, MZ, 워킹맘, 직장인]
  reply_rounds: 3  (controversy_level: high)
  reason: "최저임금/알바 문제는 고용주-피고용인 직접 갈등"

→ 자영업자가 "사장 입장"에서 토론 주제 제시
→ 취준생·MZ는 알바 입장, 자영업자는 사장 입장으로 격렬 토론
```
