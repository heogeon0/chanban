# Research - 찬반 토론 앱의 검색/탐색 페이지 UI 개선

작성일: 2026-04-03

---

## 아키텍처

### 디렉토리 구조 (apps/web/app 기준)

```
apps/web/app/
├── page.tsx                    # 홈 페이지 (태그 필터 + 토픽 목록)
├── layout.tsx                  # 루트 레이아웃 (헤더, 탭바, 메인 컨테이너)
├── search/                     # 검색/탐색 페이지 (신규)
│   ├── page.tsx               # 검색 페이지 메인
│   └── widgets/
│       ├── searchBar.tsx       # 검색 입력 바
│       └── categoryGrid.tsx    # 카테고리 탐색 그리드
├── topics/                     # 토픽 상세 페이지 및 피드
│   ├── page.tsx               # 리다이렉트 (/?tag=... 형식으로)
│   ├── domains/               # API 데이터 레이어
│   │   ├── index.ts          # topicDomains 객체 (API 클라이언트)
│   │   └── constants.ts       # 상수 (TAG_MAP, CATEGORY_FILTERS)
│   ├── features/              # React Query 훅
│   │   ├── use-infinite-topics.ts
│   │   └── use-create-post.ts
│   ├── [id]/                  # 토픽 상세 페이지
│   ├── create/                # 토픽 작성 페이지
│   └── widgets/               # 공용 컴포넌트
│       ├── topicCard.tsx      # 토픽 카드 (메인 컴포넌트)
│       ├── topicsContent.tsx  # RSC - 태그별 콘텐츠 (HOT + 최신)
│       ├── categoryFilter.tsx # 카테고리 필터 탭
│       ├── topicList.tsx      # 무한스크롤 리스트
│       └── topicsListSkeleton.tsx
├── auth/, users/, my/, notifications/ # 기타 페이지
└── shared/components/
    ├── bottom-tab-bar.tsx     # 하단 탭 네비게이션
    └── (기타 공용 컴포넌트)
```

### 데이터 흐름 패턴

**RSC (React Server Components) → Client Components → React Query**

1. **RSC 레벨** (서버에서 한 번만 실행)
   - `page.tsx`: searchParams 받음
   - `TopicsContent.tsx`: 초기 데이터 fetch (await)
   - 초기 페이지 데이터만 서버에서 가져옴

2. **Client Component 레벨**
   - `TopicList.tsx`: "use client" - 무한스크롤 로직
   - `useGetInfiniteTopics()` 훅: 다음 페이지부터 fetch

3. **React Query**
   - `topicQueries.list()`: 각 페이지 요청
   - 캐싱 및 상태 관리

### 주요 파일 목록 (검색 페이지 관련)

| 파일 경로 | 역할 |
|---------|------|
| `apps/web/app/search/page.tsx` | 검색 페이지 메인 |
| `apps/web/app/search/widgets/searchBar.tsx` | 검색 입력 바 |
| `apps/web/app/search/widgets/categoryGrid.tsx` | 카테고리 그리드 |
| `apps/web/app/topics/widgets/topicCard.tsx` | 토픽 카드 (재사용) |
| `apps/web/app/topics/domains/index.ts` | API 클라이언트 |
| `apps/web/shared/components/bottom-tab-bar.tsx` | 하단 탭 네비 |
| `apps/web/styles/globals.css` | 디자인 토큰 |
| `apps/api/src/post/post.controller.ts` | API 엔드포인트 |

---

## 디자인 토큰 (globals.css)

### 타이포그래피

- **Display** (22px, 28px line-height, 800 weight) - 앱 로고
- **Heading-lg** (20px, 700 weight)
- **Heading-md** (15px, 600 weight) - 섹션 제목
- **Heading-sm** (14px, 600 weight)
- **Body-md** (14px, 400 weight)
- **Body-sm** (13px, 400 weight)
- **Label-md** (13px, 500 weight) - 작성자명, 태그
- **Label-sm** (12px, 400 weight)
- **Micro-md** (11px, 500 weight) - footer, 배지
- **Micro-sm** (10px, 500 weight)

### 컬러 토큰

**Light Mode:**
- `--primary`: oklch(0.591 0.207 253) - 주 색상 (보라색)
- `--background`: oklch(0.976 0.003 247) - 배경
- `--card`: oklch(1 0 0) - 카드 배경
- `--border`: oklch(0.955 0.004 247)
- `--muted`: oklch(0.961 0.003 247)
- `--muted-foreground`: oklch(0.52 0.014 264)

**Opinion Colors (찬반 의견):**
- `--opinion-agree`: oklch(0.532 0.159 251.406) - 찬성 (파란색)
- `--opinion-disagree`: oklch(0.578 0.218 27.325) - 반대 (빨간색)
- `--opinion-neutral`: oklch(0.556 0.014 264.052) - 중립 (회색)

**Dark Mode:** (약간 밝혀진 톤)
- `--primary`: 동일
- `--background`: oklch(0.12 0 0)
- `--card`: oklch(0.17 0.005 264)

### 라디우스
- `--radius`: 0.625rem (10px)

---

## 현재 검색 페이지 상태 (2026-04-03)

### SearchBar 컴포넌트
- **상태**: 구현 완료 (기본 UI)
- **기능**:
  - 텍스트 입력 받음
  - 포커스 시 "취소" 버튼 표시
  - 입력값 있을 때 X 버튼으로 초기화
  - 현재 텍스트 검색 API 미지원 (placeholder)
- **스타일**: 
  - 포커스 시: border + ring-2 primary 스타일
  - muted 배경에서 card + border로 전환

### CategoryGrid 컴포넌트
- **상태**: 구현 완료
- **기능**: 
  - 7개 카테고리 (정치, 경제, 기술, 사회, 연예, 스포츠, 기타)
  - 각 카테고리별 emoji + 그라데이션 배경
  - 클릭 시 `/?tag=CATEGORY` 로 홈페이지로 이동
- **레이아웃**: 2열 그리드 (grid-cols-2)
- **각 카테고리 색상**:
  - 정치: 블루
  - 경제: 에메랄드
  - 기술: 바이올렛
  - 사회: 오렌지
  - 연예: 핑크
  - 스포츠: 라임
  - 기타: 슬레이트

### 페이지 전체 구조
```
/search
├── 고정 헤더 (sticky top-[57px])
│   └── SearchBar
├── 섹션: "카테고리 탐색"
│   └── CategoryGrid
└── 섹션: "지금 인기 토픽" (Suspense + TopicCard 목록)
```

### 현재 UI 구현 패턴
- **sticky header**: top-[57px] z-40 (헤더 높이 고려)
- **섹션 구조**: 아이콘 + 타이틀 + 콘텐츠
- **TopicCard 재사용**: 토픽 피드와 동일한 카드 사용
- **스켈레톤 로딩**: TopicsListSkeleton 사용

---

## API 현황

### 사용 가능한 엔드포인트 (post.controller.ts)

| 메소드 | 경로 | 설명 | 파라미터 |
|-------|------|------|---------|
| GET | `/api/posts/recent` | 최신 게시글 (정렬 가능) | sort, page, limit |
| GET | `/api/posts/tags/:tag` | 태그별 게시글 | tag, page, limit, sort |
| GET | `/api/posts/:id` | 게시글 상세 | id |
| GET | `/api/posts/:id/vote-count` | 투표 수 조회 | id |
| POST | `/api/posts/create` | 게시글 작성 | (인증 필요) |
| PATCH | `/api/posts/:id` | 게시글 수정 | id |
| DELETE | `/api/posts/:id` | 게시글 삭제 | id |

### 쿼리 파라미터 지원

**PaginationQueryDto & PostQueryDto:**
- `page`: 페이지 번호 (기본 1)
- `limit`: 페이지당 개수 (기본 20, 최대 100)
- `sort`: PostSortBy 열거형 (RECENT 또는 POPULAR)
- `order`: SortOrder (ASC 또는 DESC, 기본 DESC)

### 검색 기능 현황
- **텍스트 검색**: API 미지원
- **카테고리 필터**: 완전 지원 (tag 파라미터)
- **정렬**: 최신순/인기순 지원
- **페이지네이션**: 무한스크롤 지원

### 프론트 API 클라이언트 (topicDomains)

```typescript
topicDomains = {
  parseSortSearchParams(searchParams),  // 파라미터 파싱
  getAllPosts(),                        // 전체 인기 포스트
  getLatestPostsByTag(tag),             // 태그별 최신
  getHotPostsByTag(tag, limit),         // 태그별 인기
}
```

---

## 기존 컴포넌트 패턴 분석

### TopicCard 패턴

**재사용되는 곳:**
- 홈페이지 (전체/카테고리별)
- 검색 페이지 (인기 토픽)
- 사용자 페이지

**주요 요소:**
1. **헤더**: 카테고리 배지 + HOT 배지 + 작성자 의견 + 시간
2. **제목**: line-clamp-2 (2줄 제한)
3. **찬반 분포 바**: 실시간 %.with 인렬 조율
4. **푸터**: 투표수 + 댓글수 + 내 선택

**Props:**
- `post: PostResponse`
- `myVote?: VoteStatus`
- `isHot?: boolean`

### 섹션 헤더 패턴 (topicsContent.tsx)

```tsx
<div className="px-5 pt-3 pb-1 flex items-center gap-1.5">
  <Icon className="w-4 h-4" />  // Flame, Clock, TrendingUp 등
  <span className="text-[14px] font-bold">섹션명</span>
</div>
```

### 카테고리 필터 패턴 (categoryFilter.tsx)

- **레이아웃**: 가로 스크롤 (overflow-x-auto)
- **활성 상태**: primary 배경 + primary-foreground 텍스트
- **비활성**: muted 배경
- **구조**: Link 탭 (searchParams 기반 라우팅)

### 하단 탭 네비게이션 (bottom-tab-bar.tsx)

- **5탭**: 홈 / 탐색 / 글쓰기(FAB) / 알림 / 마이
- **FAB**: 중앙에 +12px offset (-mt-4)
- **인증 처리**: protected 탭은 로그인 체크 후 로그인 페이지로
- **active 상태**: primary 텍스트 컬러

---

## 개선 포인트 & 분석

### 현재 검색 페이지의 부족한 부분

1. **텍스트 검색 기능 미지원**
   - SearchBar는 UI만 구현 (handleSubmit에서 주석 처리)
   - API 레벨: 텍스트 검색 엔드포인트 없음
   - 개선 방안:
     - API에서 `GET /api/posts/search?q=keyword` 추가 필요
     - SearchBar에서 검색 결과 페이지로 이동 또는 결과 표시

2. **카테고리 그리드 UX**
   - 현재 2열 그리드로 7개 카테고리 표시
   - 모바일에서 약간 비효율적일 수 있음
   - 개선 안:
     - 3열 그리드 고려 (카드 크기 조정)
     - 카테고리 별도 "모두 보기" 섹션
     - 최근 보던 카테고리 상단 고정

3. **홈페이지와의 일관성**
   - 검색 페이지: SearchBar + CategoryGrid + 인기토픽
   - 홈페이지: CategoryFilter(탭) + TopicsContent
   - **개선**: CategoryGrid 클릭 → 홈의 CategoryFilter 탭과 동일하게 동작
   - 이미 구현됨 (`/?tag=${tag}` 링크)

4. **검색 결과 컨테이너 부재**
   - SearchBar에 입력했을 때 결과를 어디에 표시할지 미정
   - 개선 안:
     - 현재 페이지에서 인기토픽 대신 검색 결과 표시
     - 또는 `/search/results?q=keyword` 새 페이지

### 다른 페이지와의 디자인 일관성 체크

| 항목 | 검색 페이지 | 홈 페이지 | 상세 페이지 | 평가 |
|-----|----------|---------|----------|------|
| 헤더 sticky | ✓ | ✓ | ✓ | 일관성 good |
| 섹션 아이콘 | ✓ | ✓ | - | 일관성 good |
| TopicCard | ✓ | ✓ | 다름 | 일관성 good |
| 카테고리 필터 | 그리드 | 탭 | - | 다름 (의도적) |
| 탭바 | ✓ | ✓ | ✓ | 일관성 good |

**결론**: 전반적으로 일관성 있게 구현됨. CategoryGrid는 탐색 목적이므로 탭과 다르게 설계하는 것이 적절.

### 검색 기능 추가 가능성 (API 레벨)

**현재 상태:**
- GET `/api/posts/recent` - 최신순/인기순
- GET `/api/posts/tags/:tag` - 카테고리 필터
- **텍스트 검색 미지원**

**추가 가능 엔드포인트:**
```
GET /api/posts/search?q=keyword&tag=politics&sort=recent&page=1
```

**DTO 확장 (PostQueryDto):**
```typescript
@IsOptional()
@MinLength(1)
@MaxLength(200)
q?: string;  // 검색 키워드
```

**구현 복잡도**: 낮음 (DB Full-Text Search 또는 LIKE 쿼리 추가)

---

## 권장 개선 사항 (우선순위)

### P0 (필수)
1. ✓ SearchBar 기본 UI 완료
2. ✓ CategoryGrid 완료
3. ✓ 인기토픽 피드 완료
4. [ ] 텍스트 검색 API 구현 (백엔드)
5. [ ] SearchBar 검색 기능 연동 (프론트)

### P1 (권장)
1. [ ] 검색 결과 페이지 레이아웃 구성
2. [ ] 최근 검색 기록 (localStorage 또는 DB)
3. [ ] 인기 검색어 섹션
4. [ ] CategoryGrid 카드 UX 개선 (호버 애니메이션)

### P2 (추가 고도화)
1. [ ] 검색 필터 (카테고리, 정렬)
2. [ ] 검색 자동완성
3. [ ] 검색 분석 및 인기 검색어 수집

---

## 파일 경로 요약

### 검색 페이지 구현
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/web/app/search/page.tsx`
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/web/app/search/widgets/searchBar.tsx`
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/web/app/search/widgets/categoryGrid.tsx`

### 재사용 컴포넌트
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/web/app/topics/widgets/topicCard.tsx`
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/web/app/topics/widgets/topicsContent.tsx`
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/web/app/topics/widgets/categoryFilter.tsx`

### 디자인 토큰 & 스타일
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/web/styles/globals.css`

### API
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/api/src/post/post.controller.ts`
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/api/src/post/dto/post-query.dto.ts`
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/apps/web/app/topics/domains/index.ts`

### 타입 정의
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/packages/shared-types/src/enums.ts`
- `/Users/heogeonnyeong/.superset/worktrees/chanban/heogeon0/design/packages/shared-types/src/post.ts`

---

## 결론

검색/탐색 페이지는 **기본 UI 구현이 완료**되었으며, 다음 단계로 나아가기 위해서는:

1. **백엔드**: 텍스트 검색 API 엔드포인트 구현 필요
2. **프론트**: SearchBar에서 검색 결과 표시 로직 추가
3. **UX**: CategoryGrid 카드의 호버/활성 상태 시각화 강화
4. **선택사항**: 최근 검색 기록, 인기 검색어 등 고도화

현재 디자인 토큰, 컴포넌트 패턴, API 구조 모두 일관성 있게 설계되어 있어 추가 기능 구현이 용이한 상태입니다.

---

### [2026-04-06] 검색 API 백엔드 구현

#### Post 엔티티 주요 필드
- `title` varchar(100) — 검색 대상
- `content` text — 검색 대상
- `creator` ManyToOne(User) — leftJoin으로 nickname 접근
- `deletedAt` — soft delete, WHERE `IS NULL` 필수
- `popularityScore` float (Index) — 인기순 정렬에 사용
- `createdAt` — 최신순 정렬 기본값

#### User 엔티티 (작성자 검색)
- `nickname` varchar unique — 작성자 검색 대상
- Post와 OneToMany 관계 (Post.creator로 접근)

#### 기존 서비스 패턴
- `findRecentPosts`, `findPostsByTag` 모두 `findAndCount` + `where` 오브젝트 사용
- 검색은 OR 조건 + JOIN 필요 → `createQueryBuilder` 사용
- `leftJoinAndSelect('post.creator', 'creator')` — relations 처리와 JOIN 조건을 동시에 해결
- `getManyAndCount()` — `[items, total]` 반환 형태 (`findAndCount`와 동일)

#### Pagination 처리
- `skip = (page - 1) * limit`
- `new ResponseWithMeta(items, { total, page, limit, totalPages })` 로 반환
- 프론트 `PaginatedResponse<PostResponse>` 타입과 호환

#### 검색 구현 시 고려사항
- `ILIKE`: PostgreSQL 대소문자 무시 (MySQL이면 `LIKE`로 변경)
- 라우팅 순서: `recent` → `search` → `tags/:tag` → `:id` (충돌 방지)
- `SearchType` enum: `ALL`(title+content+nickname), `CONTENT`(title+content), `AUTHOR`(nickname)
- `q` 필드는 필수 — 빈 검색 요청 자체를 막음 (`MinLength(1)`)
