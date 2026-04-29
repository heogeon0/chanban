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

### [2026-04-10] 마이페이지 내 투표 목록 디자인 개선

#### 1. 투표 데이터 구조

**VoteResponse** (`packages/shared-types/src/vote.ts`):
```typescript
interface VoteResponse {
  id: string;
  postId: string;
  userId: string;
  currentStatus: VoteStatus;  // 'agree' | 'disagree' | 'neutral'
  changeCount: number;         // 투표 변경 횟수
  firstVotedAt: Date;          // 최초 투표 시각
  lastChangedAt: Date | null;  // 마지막 변경 시각
}
```

**VoteStatus** (`packages/shared-types/src/enums.ts`):
- `AGREE = 'agree'`
- `DISAGREE = 'disagree'`
- `NEUTRAL = 'neutral'`

**Vote 엔티티** (`apps/api/src/entities/vote.entity.ts`):
- `postId`, `userId` (Unique 제약: 1인 1투표)
- `currentStatus: VoteStatus`
- `changeCount: number` (default 0)
- `firstVotedAt: Date` (CreateDateColumn)
- `lastChangedAt: Date | null`
- relations: `post (ManyToOne Post)`, `user (ManyToOne User)`, `history (OneToMany VoteHistory)`

**VoteHistory 엔티티** (`apps/api/src/entities/vote-history.entity.ts`):
- `fromStatus: VoteStatus | null` (최초 투표 시 null)
- `toStatus: VoteStatus`
- `changedAt: Date`
- 투표 변경 이력 추적용

**CreateVoteDto** (`apps/api/src/vote/dto/create-vote.dto.ts`):
- `postId: string` + `status: VoteStatus` 만 전달
- **의견(comment) 필드 없음** — 투표 시 의견을 함께 남기는 기능은 존재하지 않음

#### 2. API 응답: myVotes

**엔드포인트**: `GET /api/users/me/votes?page=1&limit=10`

**프론트 쿼리** (`apps/web/shared/queries/user.ts`):
```typescript
interface MyVoteResponse extends VoteResponse {
  post: PostResponse;  // post + post.creator 관계 포함
}
// 반환: PaginatedResponse<MyVoteResponse>
```

**백엔드 서비스** (`apps/api/src/user/user.service.ts` — `findMyVotes`):
- `voteRepository.findAndCount({ where: { userId }, order: { firstVotedAt: 'DESC' }, relations: ['post', 'post.creator'] })`
- 정렬: `firstVotedAt DESC` (최초 투표일 기준 내림차순)
- **현재 필터/정렬 파라미터 미지원** (page, limit만)

**프론트 무한스크롤 훅** (`apps/web/app/my/features/use-infinite-my-votes.ts`):
- `useInfiniteQuery` 사용, pageParam 기반 페이지네이션
- 페이지당 10개

#### 3. 투표 기능 흐름 (투표 시 의견 남기기 여부)

**투표 버튼** (`apps/web/app/topics/[id]/widgets/voteButtons.tsx`):
- 찬성/반대/중립 3개 버튼, 선택 시 `onVote(status)` 호출
- `onShowCommentForm` 콜백 prop 존재하나 **현재 사용되지 않음** (topicDetailContent.tsx에서 전달하지 않음)
- 투표와 댓글은 완전히 **분리된 기능** — 투표 후 별도로 댓글 작성 가능

**댓글과 투표의 관계**:
- 댓글 자체에는 투표 상태 필드가 없음
- 댓글 작성자의 투표 이력은 `user.voteHistory: VoteHistoryResponse[]`로 간접 참조
- 댓글 컴포넌트에서 `latestVote = comment.user.voteHistory.at(-1)?.toStatus`로 작성자의 최신 투표 상태를 좌측 컬러바에 표시

#### 4. 현재 내 투표 탭 구현 분석

**MyVotesTab** (`apps/web/app/my/widgets/myVotesTab.tsx`):
- `useInfiniteMyVotes()` → `allVotes.map(vote => <TopicCard post={vote.post} myVote={vote.currentStatus} />)`
- TopicCard를 그대로 재사용 — **투표 관련 추가 정보(투표 시각, 변경 횟수 등) 미표시**
- 카드 레이아웃: `flex flex-col gap-3 px-3 pb-3`
- 빈 상태: 센터 텍스트 "투표한 내역이 없습니다."

**TopicCard에서 myVote 표시** (`apps/web/app/topics/widgets/topicCard.tsx`):
- 카드 footer 맨 오른쪽에 `내 선택: {찬성|반대|중립}` 텍스트 (11px, font-semibold)
- `ml-auto`로 우측 정렬
- opinion-agree/disagree/neutral 색상 적용
- **매우 작고 눈에 띄지 않음** — 투표 목록 전용 카드에서는 더 강조 필요

#### 5. 현재 필터 UI 패턴

**CategoryFilter** (`apps/web/app/topics/widgets/categoryFilter.tsx`):
- 가로 스크롤 pill 버튼 (`overflow-x-auto`)
- 활성: `bg-primary text-primary-foreground`
- 비활성: `bg-muted text-muted-foreground hover:text-foreground`
- `rounded-full text-xs font-semibold`
- Link 기반 (searchParams 라우팅)

**댓글 정렬 토글** (`topicDetailContent.tsx`):
- pill 형태 `bg-muted` 컨테이너 안에 인기/최신 버튼
- 활성: `bg-card shadow-sm text-foreground`
- 비활성: `text-muted-foreground`
- `rounded-full text-xs font-medium`
- 클라이언트 state 기반

**마이페이지 탭** (`apps/web/app/my/page.tsx`):
- 2탭 (내 투표 목록 / 내 토픽 목록)
- 활성: `border-b-2 border-opinion-agree text-opinion-agree`
- 비활성: `border-transparent text-muted-foreground`
- `text-sm font-bold`
- 클라이언트 state 기반 (`useState<TabType>`)

#### 6. 카드/리스트 아이템 패턴

**TopicCard** (범용 — 홈, 검색, 마이페이지에서 모두 사용):
- `rounded-2xl border border-border bg-card p-4 hover:bg-muted/10 transition-colors`
- 구조: 헤더(태그배지 + HOT배지 + 작성자의견 + 시간) → 제목(2줄) → 찬반바(28px) → footer(투표수 + 댓글수 + 내선택)

**댓글 카드** (`comment.tsx`):
- 좌측 컬러바(w-1) + 우측 카드(`rounded-r-xl border border-l-0 border-border bg-card p-3`)
- 헤더: 아바타배지 + 닉네임 + 시간 + 투표상태배지
- 본문 + 액션버튼(좋아요, 답글)

**피드 MyVotesSection** (`apps/web/app/feed/widgets/myVotesSection.tsx`):
- 홈 피드에서 최근 3개 투표를 보여주는 섹션
- `divide-y divide-border/50` 구분선 패턴 사용
- TopicCard 재사용 (동일 문제)

#### 7. 디자인 시스템 요약 (`.interface-design/system.md`)

- **Spacing**: 4px 단위, 카드 내부 p-4, 리스트 gap-3
- **Border Radius**: 카드 rounded-xl, pill rounded-full, 입력 rounded-md
- **Depth**: border-only (shadow는 overlay/modal만), `border border-border`
- **Color**: OKLch, opinion-agree(보라), opinion-disagree(빨강), opinion-neutral(회색)
- **Typography**: Pretendard, body-md(14px), micro-md(11px), label-md(13px)
- **Card 패턴**: `border border-border bg-card rounded-xl p-4`, hover `hover:bg-muted/10 transition-colors`
- **Badge/Chip**: `px-2 py-0.5 rounded-full text-xs font-medium bg-muted`

#### 8. 핵심 발견 사항

**투표 시 의견(comment) 기능은 없음**:
- CreateVoteDto에 comment/reason 필드 없음
- Vote 엔티티에도 의견 필드 없음
- 투표와 댓글은 완전 분리된 도메인

**MyVoteResponse에서 활용 가능한 추가 데이터**:
- `firstVotedAt` — 투표 시각 (현재 미표시)
- `lastChangedAt` — 마지막 변경 시각 (현재 미표시)
- `changeCount` — 투표 변경 횟수 (현재 미표시)
- `currentStatus` — 현재 투표 상태 (카드 footer에 작게 표시)

**현재 API 한계**:
- `/api/users/me/votes`는 필터 파라미터 미지원 (찬성/반대/중립 필터 불가)
- 정렬도 `firstVotedAt DESC` 고정 (인기순 등 불가)
- 필터/정렬 추가 시 백엔드 수정 필요

**디자인 개선 포인트**:
- 내 투표 상태가 카드 footer에 11px 텍스트로만 표시 — 투표 목록에서는 더 강조 필요
- 투표 시각, 변경 횟수 등 부가 정보 표시 가능
- 찬성/반대/중립 필터 추가하면 목록 탐색성 향상
- 투표 상태별 시각적 구분 (좌측 컬러바, 카드 테두리 등) 댓글 컴포넌트의 컬러바 패턴 참고 가능

### [2026-04-22] 이미지 업로드 기능 (Supabase Storage)

스토리지: **Supabase Storage 확정**. 게시글 본문 + 댓글(대댓글 포함)에 이미지 첨부 기능 추가.

#### 0. 기존 조사 사실 재검증 (파일 확인 결과)

모두 일치 확인:
- 게시글 생성: `apps/web/app/topics/create/page.tsx` → `apps/web/app/topics/widgets/topicCreateForm.tsx`가 `@lexical/react/LexicalPlainTextPlugin` 사용, `root.getTextContent()`로 순수 텍스트만 추출 (줄 9, 48).
- 훅: `apps/web/app/topics/features/use-create-post.ts` → `topicMutations.create` 호출 (줄 13).
- DTO (FE): `apps/web/shared/queries/topic.ts` 줄 106~112 `CreatePostDto { title, content, tag, showCreatorOpinion?, creatorOpinion? }`.
- 댓글 생성: `apps/web/app/topics/[id]/widgets/commentForm.tsx` 역시 `PlainTextPlugin` + `getTextContent()` (줄 8, 89).
- 훅: `apps/web/app/topics/[id]/features/use-post-comment.ts` → `commentMutations.create` (줄 18).
- DTO (FE): `apps/web/shared/queries/comment.ts` 줄 85~89 `CreateCommentDto { content, postId, parentId? }`.
- 엔티티: `apps/api/src/entities/post.entity.ts` content `text` (줄 35), title `varchar(100)` (줄 32). `apps/api/src/entities/comment.entity.ts` content `text` (줄 52).
- DTO (BE): `apps/api/src/post/dto/create-post.dto.ts` `@MinLength(1) content` + `MaxLength 없음`. `apps/api/src/comment/dto/create-comment.dto.ts` `@MinLength(1) content`.
- 인증: `apps/api/src/auth/guards/jwt-auth.guard.ts` — Passport JWT 단순 래핑. `@CurrentUser()` 데코레이터는 `request.user` 반환.
- 업로드 인프라 **0개** 확인: `grep` 결과 `multer|FileInterceptor|Storage|@supabase` 모두 hit 없음. `@nestjs/platform-express`만 설치됨 (`apps/api/package.json` 줄 35).
- 게시글 수정 페이지 없음 재확인 (`apps/web/app/topics` 하위에 `[id]/edit` 디렉토리 없음). `post.controller.ts`의 `PATCH /posts/:id`는 껍데기 (`post.service.ts` 줄 256~258에 `return \`This action updates a #${id} post\``).
- 댓글 수정 컨트롤러 엔드포인트 존재 (`comment.controller.ts` 줄 65~68 `@Patch(':id')`)하나 서비스가 stub (`comment.service.ts` 줄 564~566).
- `User.profileImageUrl` `text nullable` (`user.entity.ts` 줄 30~31) — 업로드 로직은 없음.
- 인프라: `railway.toml` 그대로, `apps/web/next.config.mjs`는 **완전 빈 객체** (`nextConfig = {}`) → `images.remotePatterns` 등 전무.

추가 발견 사실 (조사 외):
- `apps/api/src/main.ts` 줄 34~37: 전역 `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` — **DTO에 선언 안 된 필드는 요청 자체가 400 에러**가 됨. 이미지 필드 추가 시 DTO 수정 필수.
- `apps/web/lib/httpClient.ts` 줄 167~177: `post`/`put`/`patch`가 **무조건 `JSON.stringify` + `Content-Type: application/json`** 적용. 즉 multipart/form-data 업로드는 이 클라이언트로 불가능 → 별도 fetch 직접 호출이나 client 확장 필요.
- `apps/api/src/config/database.config.ts` 줄 14: `synchronize: true` (주석: "프로덕션 테이블 생성 후 복원"). `apps/api/src/data-source.ts` 줄 23도 동일. **마이그레이션 파일 디렉토리 자체가 없음** (typeorm-extension은 seeder로만 사용). 컬럼 추가 시 엔티티만 수정하면 TypeORM이 자동 반영.

#### 1. shared-types — 이미지 필드 추가 영향

**현재**: `packages/shared-types/src/post.ts`의 `PostResponse`에 이미지 필드 없음 (줄 9~26 전체 확인). `packages/shared-types/src/comment.ts`의 `CommentResponse`/`CommentReplyResponse`도 마찬가지 (줄 23~56).

**영향**: `PostResponse.images: string[]` / `CommentResponse.images: string[]` 추가 시 `index.ts`의 barrel export만 유지되면 자동 전파. 실제로 다음 지점이 값을 읽게 됨:
- `apps/web/app/topics/[id]/page.tsx` 줄 140~144 (본문 렌더)
- `apps/web/app/topics/[id]/widgets/comment.tsx` 줄 170~172 (댓글 본문)
- `apps/web/app/topics/[id]/widgets/replyComment.tsx` 줄 77~79 (답글 본문)
- `apps/web/app/topics/widgets/topicCard.tsx` (토픽 카드 썸네일로 사용 가능 여부 — 별도 검토)
- `apps/api/src/post/post.service.ts`, `apps/api/src/comment/comment.service.ts` 의 응답 매핑

**CreatePostDto / CreateCommentDto**: FE `topic.ts` / `comment.ts`, BE `dto/*.dto.ts` 총 4곳 모두 `images?: string[]` (혹은 `imageKeys?: string[]`) 추가 필요.

#### 2. 본문/댓글 렌더링 경로 (이미지 삽입 방식 결정에 핵심)

현재 렌더링은 모두 **plain text + `whitespace-pre-wrap`**:
- `apps/web/app/topics/[id]/page.tsx` 줄 141: `<p className="... whitespace-pre-wrap">{topic.content}</p>` — HTML/마크다운 파싱 전혀 없음.
- `comment.tsx` 줄 170, `replyComment.tsx` 줄 77: 동일 패턴.

즉 `content`는 순수 텍스트 보존이 목표고, 인라인 이미지 HTML을 content 문자열에 박으면 **XSS 위험 + 렌더러 변경 필요**.

**파생 결론**: 본문 = 텍스트, 이미지 = 별도 `images: string[]` 필드에 URL 배열로 두고 UI에서 본문 아래/위 섹션으로 분리해 렌더하는 방식이 현 구조와 자연스럽게 맞음. Lexical 커스텀 Node/RichText 확장은 오버엔지니어링 가능성 큼 (§3 참조).

#### 3. Lexical 에디터 확장성 (인라인 vs 첨부)

현재 의존성: `apps/web/package.json` 줄 18~20, 30 — `@lexical/plain-text`, `@lexical/react`, `@lexical/rich-text`, `@lexical/utils`, `lexical` 모두 설치됨 (`rich-text`는 이미 설치만 되어 있고 사용처 없음).

**옵션 A — Lexical RichText + 커스텀 ImageNode**:
- 장점: 진짜 인라인 이미지 삽입 (본문 흐름 중간 삽입). Facebook Lexical 공식 ImageNode 예제 존재.
- 단점:
  - 직렬화 포맷이 텍스트 → `LexicalEditor.toJSON()` 결과(구조화된 JSON)로 바뀜. DB `content: text`에 JSON을 저장하면 `content: string` 소비처 전부(SEO metadata의 `topic.content.slice(0,120)` `page.tsx` 줄 43, AI 요약의 `summaryService.generateContentSummary(post)` `post.service.ts` 줄 219 등) 깨짐.
  - 뷰어 쪽도 JSON → React 트리로 렌더하는 로직을 별도 구현해야 함 (현재는 text만).
  - XSS, 에디터/뷰어 양쪽 유지보수 부담 증가.

**옵션 B — PlainText 유지 + 첨부형 이미지 섹션 (추천)**:
- 에디터는 현재 그대로, 폼에서 별도의 `ImageUploader` 컴포넌트가 `images: string[]` 상태를 관리.
- `CreatePostDto`/`CreateCommentDto`에 `images?: string[]` 추가.
- 렌더 시 `page.tsx`에서 `topic.content` 블록 아래 `<ImageGallery images={topic.images} />` 형태로 렌더.
- 장점: 기존 AI 요약/메타/검색(`post.content ILIKE` in `post.service.ts` 줄 128 등) 전부 무영향. 구현 범위 작음.
- 단점: 이미지 "본문 중간 삽입" UX는 못 줌. 첨부 방식이 됨.

**트레이드오프 결론**: 프로젝트 철학(의견 토론, content 요약 AI 의존) 고려 시 **B안**이 합리적. 추후 RichText 전환은 content 스키마를 `contentJson jsonb` 추가로 별도 도입 가능.

#### 4. Supabase 연동 방식 (A 직접 업로드 vs B API 경유)

**A. 프론트 직접 업로드 (`@supabase/supabase-js` + signed upload URL)**
- 흐름: FE → NestJS (JWT 검증 후 `createSignedUploadUrl` 발급) → FE가 Supabase Storage에 직접 PUT → 업로드된 객체 경로/URL을 `CreatePostDto.images`에 담아 제출.
- 장점:
  - API 서버 CPU/메모리 소비 0 (큰 파일 스트림 부담 없음).
  - Railway `asia-southeast1` 인스턴스 네트워크 사용량 절감 (`railway.toml` 기준).
  - Supabase는 파일 크기/MIME 정책을 버킷 레벨에서 기본 제공.
- 단점:
  - FE에 Supabase 의존성 추가 (`@supabase/supabase-js`).
  - 게시글 제출 전에 업로드 완료된 "고아 파일(orphan)" 발생 가능 → 주기적 정리 cron이나 `post.images`와 join으로 TTL 삭제 필요.
  - 소유권 검증이 FE 신뢰 기반 — API 단계에서 "이 key를 제출한 userId가 업로드한 사용자인지" 재확인 로직 필요 (서명 URL 발급 시 path에 userId prefix를 강제해 검증).

**B. API 경유 업로드 (Nest `FileInterceptor` + multer + `@supabase/supabase-js` server-side)**
- 흐름: FE → `multipart/form-data`로 NestJS → multer 메모리/디스크 저장 → server SDK가 Supabase에 업로드 → DB에 URL 저장 → 응답.
- 장점:
  - 검증 로직(MIME/사이즈/개수/소유권)을 전부 서버에서 일관 처리.
  - 고아 파일 없음 (업로드 + DB insert 원자적 처리 가능, 실패 시 compensating delete).
  - `httpClient`가 JSON 전용이라 FE 수정 여파는 있지만 그래도 로직 중앙화 장점이 큼.
- 단점:
  - Railway 인스턴스 트래픽/CPU 증가 (파일을 한 번 받았다가 다시 업로드).
  - `httpClient` 확장 필요 (`Content-Type: application/json` 강제 제거, FormData 지원).
  - multer/FileInterceptor 세팅, 메모리 정책, 에러 처리 추가.

**결론**: 이 프로젝트의 현재 상태(auth = JWT, 배포 = 단일 소형 Railway 인스턴스, FE 모놀리식 Next.js)에서는 **A안(프론트 직접 업로드 + 서명 URL 발급 API)**이 운영 측면에서 안전함. 단 "Create signed upload URL" 엔드포인트는 NestJS에 추가해 서버가 버킷/path/만료를 통제.

**실전 절충 권장안 (A')**:
1. `POST /api/uploads/sign` (JwtAuthGuard) — body `{ scope: 'post' | 'comment', filename, mimeType, size }` → 서버가 MIME/size 검증 후 `@supabase/supabase-js`의 `storage.from(bucket).createSignedUploadUrl(path)` 호출, `{ uploadUrl, token, publicUrl, key }` 반환. path는 `${scope}/${userId}/${uuid}.${ext}`로 강제.
2. FE가 받은 `uploadUrl`에 직접 PUT.
3. 게시글/댓글 제출 시 `images: [key1, key2]`만 전달. 서버에서 `key`의 userId prefix를 요청자 JWT userId와 대조(§6).
4. 게시글/댓글 작성 실패나 유저가 취소한 업로드는 주기 정리 (소프트 삭제 cron 또는 업로드 후 10분 내 연결 안 된 객체 삭제).

#### 5. Supabase Storage 버킷 구조 설계안

**버킷 분리 안 (권장)**:
- `post-images` (public, anonymous read) — 게시글 본문 이미지.
- `comment-images` (public, anonymous read) — 댓글/답글 이미지.
- 분리 이유: ① RLS 정책/라이프사이클(댓글은 원댓글 삭제 시 연쇄 삭제) 차별화 용이, ② 로그/쿼터 가시성 향상. 단점은 관리 포인트가 2개라는 점 뿐.

**경로 규칙 (두 버킷 공통)**:
- `{userId}/{yyyy}/{mm}/{uuid}.{ext}` — postId/commentId는 업로드 시점엔 없음(게시글을 쓰기 *전에* 업로드하는 플로우가 자연스러움)이므로 userId prefix가 소유권 검증의 기초가 됨.
- 대안 `post-images/{postId}/{uuid}` — 소유권 검증은 강해지지만 "업로드 → 제출" 순서상 postId가 없어서 선업로드 UX가 깨짐. 게시글 제출 후 이동(move/copy)은 Supabase에서 가능은 하나 비용/복잡도 증가 → 비추.

**public vs private (signed URL for read)**:
- 서비스가 이미 공개 토론 플랫폼이고(`/topics/:id`는 로그인 없이 조회 가능 — `findOne`에 `JwtAuthGuard` 없음), CDN 캐시와 단순성 이득이 큼 → **public bucket + read는 공개 URL**.
- 업로드는 반드시 signed upload URL 경유 → write는 보호됨.
- 삭제는 server-side SDK(Service Role Key)로만 수행.

#### 6. 보안/검증 체크리스트

- **MIME/확장자**: `image/jpeg`, `image/png`, `image/webp`, `image/gif` 화이트리스트. SVG는 XSS 벡터이므로 **제외**.
- **최대 크기**: 클라 5MB, 서버 검증 시 동일 cap. 서명 URL 발급 전 클라가 보고하는 size + Supabase 버킷 file size limit 이중.
- **이미지 개수**:
  - 게시글: 최대 5장 (과도한 스크롤 방지 + 요약 AI 영향 최소화)
  - 댓글/답글: 최대 2장 (UX상 짧은 의견 단위 유지)
  - DTO에 `@ArrayMaxSize(5)` / `@ArrayMaxSize(2)` + `@IsArray()` + `@IsString({ each: true })` (또는 `@IsUrl`) 적용.
- **소유권 검증 (A안일 때 핵심)**:
  - DTO로 들어온 각 `key`를 파싱해 path의 userId 세그먼트 == `@CurrentUser().id` 확인.
  - 일치하지 않으면 `BadRequestException(ErrorCode.BAD_REQUEST)`.
  - `post.service.ts create` 트랜잭션 안에서 검증해 부분 저장 방지.
- **Rate limiting**: 현재 프로젝트에 Throttler 미적용. 최소한 signed URL 발급 엔드포인트에 `@nestjs/throttler` 10req/min/user 권장 (차후 이슈로 분리 가능).
- **Content-Type 강제 업로드**: signed upload URL에 `contentType` 파라미터 전달해 매핑 어긋남 차단.
- **이미지 무결성 (선택)**: 서버 응답 전에 HEAD로 실제 객체 존재 여부 1회 확인 (선택, 비용 소.)
- **표시 단계 안전장치**: `next/image`를 쓴다면 `next.config.mjs`에 `images.remotePatterns`로 Supabase 도메인 화이트리스트 필수 (현재 파일 빈 객체).

#### 7. 마이그레이션 영향 (현재 구조 기준)

- `synchronize: true` 활성 (§0 재검증 참조) — 엔티티에 컬럼 추가만 하면 앱 부팅 시 자동 반영. 마이그레이션 스크립트 작성 불필요.
- 그러나 **주석이 "프로덕션 테이블 생성 후 복원"이라 명시** — 조만간 `synchronize: false`로 전환될 전제. 그때를 대비해 엔티티 변경 시 수동 SQL을 별도로 기록해 두는 것이 안전:
  ```sql
  ALTER TABLE posts ADD COLUMN images text[] DEFAULT '{}' NOT NULL;
  ALTER TABLE comments ADD COLUMN images text[] DEFAULT '{}' NOT NULL;
  ```
- typeorm-extension은 `apps/api/src/data-source.ts` 줄 27에서 seeder로만 쓰임 (`seeds: [MainSeeder]`). 마이그레이션 용도 도입하려면 `migrations:` 옵션 + CLI 스크립트 추가 필요 — 이번 범위 아님.
- 엔티티 선언 권장:
  ```ts
  @Column('text', { array: true, default: () => "'{}'" })
  images: string[];
  ```
  (PostgreSQL `text[]` 사용. 순서 유지 필요. 10개 이상 갖는 경우는 없으므로 JSON보다 배열 컬럼이 직관적.)
- `PostResponse`/`CommentResponse` 매핑 지점: `post.service.ts`의 `create`/`findOne`/`findRecentPosts`/`findPostsByTag`/`searchPosts`가 엔티티 그대로 반환 → 컬럼만 추가하면 자동 포함. 다만 `comment.service.ts` `findByPostId`는 `queryBuilder.select([...])`로 필드를 **명시 선택** (줄 107~118) → `'reply.images'` 명시 추가 필요, `findRepliesByCommentId`는 `findAndCount`라 무관.

#### 8. 프론트 업로드 UX 관련 세부 사항

- `httpClient`가 JSON만 지원하므로 signed URL 업로드(A안)는 순수 `fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type }})` 사용.
- 업로드 진행률은 `fetch`로 불가 → 필요 시 `XMLHttpRequest` fallback 또는 Supabase JS client의 `uploadToSignedUrl` 사용 (후자 권장 — 이미 버킷 SDK가 파일 경로/토큰 관리).
- 미리보기는 제출 전 `URL.createObjectURL` 로 표시, 업로드 완료 후 반환된 public URL로 교체.
- 댓글은 공간이 좁으므로 썸네일 형태(4:3 fixed) + 클릭 시 모달 확대.

#### 9. 결론 — 권장 작업 순서

1. **백엔드 기반**: `@supabase/supabase-js` 설치, `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` env 추가, `StorageService` 모듈 생성.
2. **API 엔드포인트**: `POST /api/uploads/sign` (JwtAuthGuard) — MIME/size 검증 후 signed upload URL + key 반환.
3. **엔티티/DTO 확장**: `Post.images text[]`, `Comment.images text[]`, `CreatePostDto.images?: string[]` (@ArrayMaxSize 5), `CreateCommentDto.images?: string[]` (@ArrayMaxSize 2). `comment.service.ts`의 select 명시 목록에 `reply.images` 추가.
4. **shared-types**: `PostResponse.images: string[]`, `CommentResponse.images: string[]`, `CommentReplyResponse.images: string[]` 추가.
5. **프론트 폼**: `ImageUploader` widget(선업로드 + 미리보기 + 삭제) → `topicCreateForm.tsx` / `commentForm.tsx`에 통합, DTO에 `images` 포함.
6. **프론트 렌더**: `page.tsx` 본문 아래 이미지 갤러리, `comment.tsx` / `replyComment.tsx` 본문 아래 썸네일 + 모달.
7. **next.config.mjs**: `images.remotePatterns`에 Supabase 도메인 추가 (`next/image` 도입 시).
8. **소유권 검증**: `PostService.create` / `CommentService.create` 트랜잭션 안에 key path userId 매칭 검증.
9. **운영**: 고아 파일 정리 cron (선택, 1차 PR 범위 밖으로 분리 권장).
