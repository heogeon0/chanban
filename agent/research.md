# Project Research — 찬반 (Chanban)

최종 고정 섹션 갱신일: 2026-04-13

---

## 아키텍처

### 모노레포 구성

pnpm + Turborepo 기반 모노레포.

```
/
├── apps/
│   ├── web/      # Next.js 15 (App Router) 프론트엔드
│   └── api/      # NestJS 백엔드 (TypeORM + PostgreSQL)
├── packages/
│   ├── shared-types/       # 프론트/백 공용 타입/enum
│   ├── eslint-config/
│   └── typescript-config/
├── docker-compose.yml      # 로컬 DB
├── railway.toml            # 배포 설정
├── turbo.json
└── pnpm-workspace.yaml
```

### 기술 스택

**Frontend (`apps/web`)**
- Next.js 15 App Router (RSC + Client Components)
- TypeScript
- TailwindCSS + OKLch 디자인 토큰 (`apps/web/styles/globals.css`)
- React Query (TanStack Query) — 서버 상태 관리
- shadcn/ui 기반 UI 컴포넌트 (`apps/web/shared/ui/`)
- `lucide-react` 아이콘
- 인증 컨텍스트(`apps/web/shared/contexts/auth-context`) + JWT(쿠키/헤더)
- Google Analytics (`@next/third-parties/google`)

**Backend (`apps/api`)**
- NestJS
- TypeORM + PostgreSQL
- JWT 인증 (`@nestjs/passport`) + Kakao OAuth
- `class-validator` 기반 DTO 검증
- Jest (spec.ts 테스트)

**Shared (`packages/shared-types`)**
- `enums.ts`: `PostTag`, `VoteStatus`, `PostSortBy`, `SortOrder`
- `post.ts`, `vote.ts`, `comment.ts`, `follow.ts`, `api-response.ts`, `errors.ts`

### 프론트엔드 레이어 컨벤션 (widgets/features/domains/shared)

각 라우트(`app/<route>/`)는 내부에 기능 레이어를 가진다:

- `domains/` — API 클라이언트 함수 + 상수 (httpClient 래핑)
- `features/` — React Query 훅 (use-*.ts, 해당 도메인에만 쓰이는 비즈니스 훅)
- `widgets/` — 해당 라우트 전용 UI 컴포넌트 (컴포지션 단위)
- `page.tsx` / `[id]/page.tsx` — 진입점 (주로 RSC)

전역 공용 레이어: `apps/web/shared/`
- `shared/components/` — 전역 UI 컴포넌트 (bottom-tab-bar, user-menu, theme-toggle, protected-route, follow-button, kakao-login-button, create-topic-button)
- `shared/ui/` — shadcn 기반 순수 UI 프리미티브
- `shared/queries/` — 여러 라우트에서 공용으로 쓰는 React Query 키/훅 (`keys.ts`, `topic.ts`, `vote.ts`, `user.ts`, `comment.ts`, `follow.ts`)
- `shared/contexts/` — auth-context 등 전역 컨텍스트
- `shared/providers.tsx` — React Query/Theme 등 프로바이더 조합

기타 전역: `apps/web/lib/` (httpClient 등), `apps/web/hooks/`, `apps/web/assets/`, `apps/web/styles/`.

### 앱 라우팅 (`apps/web/app/`)

```
app/
├── layout.tsx               # 루트 레이아웃: 헤더 + main + BottomTabBar + @modal
├── page.tsx                 # 홈 = 토픽 피드 (CategoryFilter + TopicsContent)
├── @modal/                  # Parallel route (모달용)
├── auth/
│   ├── login/               # 로그인 페이지
│   ├── signup/              # 회원가입 (닉네임 설정)
│   └── kakao/               # Kakao OAuth 콜백
├── topics/
│   ├── page.tsx             # /?tag=... 로 리다이렉트
│   ├── create/              # 토픽 작성
│   ├── [id]/                # 토픽 상세 (투표/댓글)
│   ├── domains/             # topicDomains (post API 클라이언트)
│   ├── features/            # use-infinite-topics, use-create-post
│   └── widgets/             # topicCard, topicsContent, topicList, categoryFilter, topicsListSkeleton, topicCreateForm, listToggle
├── search/
│   ├── page.tsx             # 탐색(검색 + 카테고리 그리드 + 인기 토픽)
│   └── widgets/             # searchBar, categoryGrid
├── feed/
│   └── widgets/             # hotTopicsSection, latestTopicsSection, topicCarousel, tagTopicsSection, myTopicsSection, myVotesSection, feedSectionHeader, loginCtaBanner
├── my/                      # 마이페이지 (내 토픽 탭 / 내 투표 탭)
├── users/[id]/               # 타 유저 공개 프로필 (profile, 작성 토픽, 댓글)
└── notifications/           # 알림 페이지 (UI 스텁)
```

하단 탭바(`bottom-tab-bar.tsx`)는 5탭: 홈(`/`) / 탐색(`/search`) / 글쓰기 FAB(`/topics/create`, protected) / 알림(`/notifications`, protected) / 마이(`/my`, protected).

### 백엔드 모듈 구성 (`apps/api/src/`)

`AppModule`에 등록된 피처 모듈:

- `AuthModule` — Kakao OAuth 로그인, JWT 발급/갱신, RefreshToken 관리
  - `auth.controller.ts`, `auth.service.ts`, `kakao.service.ts`, `refresh-token.service.ts`
  - `guards/jwt-auth.guard.ts` (JwtAuthGuard가 유일한 가드 — **Role 기반 가드 없음**)
  - `strategies/` (passport JWT 전략)
- `UserModule` — 내 프로필/투표/토픽, 타 유저 프로필/토픽/댓글 조회, 닉네임 수정
- `PostModule` — 토픽(게시글) CRUD + 조회 (recent/search/tags/:tag/:id/vote-count)
- `VoteModule` — 투표 생성/변경 (Vote + VoteHistory)
- `CommentModule` — 댓글 CRUD + 좋아요
- `FollowModule` — 유저 팔로우/언팔로우
- `SummaryModule` — AI 요약 (entities 내부 보유)

공통 레이어:
- `common/decorators/` — `@CurrentUser()` 등
- `common/dto/` — 공용 DTO (PaginationQuery 등)
- `common/filters/` — HttpException 필터
- `common/interceptors/` — Response 래핑
- `config/database.config.ts` — TypeORM 설정
- `entities/index.ts` — 모든 엔티티 export (data-source.ts / 모듈에서 사용)

### 데이터베이스 엔티티 (`apps/api/src/entities/`)

- `user.entity.ts` — User (id, kakaoId, nickname, profileImageUrl, softDelete). **role/admin 필드 없음.**
- `post.entity.ts` — Post (id, creatorId, title, content, tag(PostTag), showCreatorOpinion, agreeCount, disagreeCount, neutralCount, commentCount, viewCount, popularityScore, softDelete)
- `vote.entity.ts` — Vote (postId+userId unique, currentStatus, changeCount, firstVotedAt, lastChangedAt)
- `vote-history.entity.ts` — VoteHistory (fromStatus, toStatus, changedAt)
- `comment.entity.ts` — Comment
- `comment-like.entity.ts` — CommentLike
- `follow.entity.ts` — Follow (follower/following)
- `refresh-token.entity.ts` — JWT 리프레시 토큰

---

## 데이터 흐름

### 인증 흐름

1. 사용자가 `/auth/login` → Kakao OAuth → `/auth/kakao` 콜백
2. 백엔드 `AuthService`가 카카오 유저 정보로 User 조회/생성, JWT accessToken + refreshToken 발급
3. 프론트 `auth-context`가 토큰 저장 및 사용자 상태 관리
4. `httpClient`(`apps/web/lib/httpClient`)가 모든 API 요청에 토큰 첨부, 만료 시 refresh
5. 보호 라우트: 탭바에서 `protected: true` 플래그로 비로그인 시 로그인 페이지 리다이렉트 (`ProtectedRoute` 컴포넌트도 존재)

백엔드 쪽은 라우트 단위로 `@UseGuards(JwtAuthGuard)` + `@CurrentUser()` 데코레이터 조합. **관리자 전용 가드/role 체크 없음.**

### 토픽 피드 데이터 흐름 (홈 `/`)

```
(URL) /?tag=politics&sort=recent
    ↓
app/page.tsx (RSC)
  - searchParams 파싱 → topicDomains.parseSortSearchParams()
  - CategoryFilter (Link 기반 탭, sticky)
  - <Suspense fallback={TopicsListSkeleton}>
      <TopicsContent selectedTag selectedSort />  ← RSC, 초기 데이터 fetch
    </Suspense>
    ↓
TopicsContent (RSC)
  - tag === "all" ? getAllPosts() : getHotPostsByTag() + getLatestPostsByTag()
  - 섹션 헤더 + <TopicList initialData={...} />
    ↓
TopicList ("use client")
  - useGetInfiniteTopics() (React Query useInfiniteQuery)
  - IntersectionObserver 기반 무한스크롤
```

- 초기 1페이지는 RSC에서 서버 fetch → HTML에 포함
- 이후 페이지는 클라이언트 React Query가 페치
- 검색 페이지(`/search`)는 RSC prerender 비활성(`force-dynamic`)으로 처리되어 있음 (최근 커밋 참고)

### 투표/댓글 흐름

- 상세 페이지(`/topics/[id]`)에서 투표 버튼 클릭 → `POST /api/votes`
- 투표 변경 시 Vote 엔티티의 `currentStatus` 갱신 + VoteHistory 레코드 추가 + Post 집계 카운트 업데이트
- 투표와 댓글은 완전 독립 도메인(투표 시 의견 코멘트 없음)
- 댓글 컴포넌트는 작성자의 최신 투표(`user.voteHistory`)를 좌측 컬러바로 간접 표시

### 상태 관리 패턴

- **서버 상태**: React Query (`@tanstack/react-query`)
  - 쿼리 키 관리: `apps/web/shared/queries/keys.ts`
  - 공용 훅: `apps/web/shared/queries/{topic, vote, user, comment, follow}.ts`
  - 라우트별 훅: 각 라우트의 `features/use-*.ts`
- **클라이언트 UI 상태**: React `useState` / URL searchParams (필터/정렬은 대부분 URL 기반)
- **전역 클라이언트 상태**: `auth-context` (사용자), theme-provider
- **폼**: 라우트별 로컬 state 또는 간단한 제어 컴포넌트 패턴

### API 응답 포맷

- 단일: `ApiResponse<T> = { data: T }`
- 목록: `PaginatedResponse<T> = { data: T[], meta: { total, page, limit, totalPages } }`
- 백엔드 `ResponseWithMeta` 클래스로 래핑, 전역 인터셉터가 통일

---

## 주요 파일

### 프론트 진입점 & 레이아웃

| 파일 | 역할 |
|---|---|
| `apps/web/app/layout.tsx` | 루트 레이아웃(헤더/로고/ThemeToggle/UserMenu/BottomTabBar/@modal 슬롯) |
| `apps/web/app/page.tsx` | **홈 = 토픽 피드** (CategoryFilter + TopicsContent) — 유저 목록 아님 |
| `apps/web/shared/providers.tsx` | React Query / Theme / Auth Providers 조합 |
| `apps/web/shared/components/bottom-tab-bar.tsx` | 5탭 하단 네비 (홈/탐색/글쓰기FAB/알림/마이) |
| `apps/web/shared/contexts/auth-context.tsx` | 사용자 인증 컨텍스트 |
| `apps/web/lib/httpClient.ts` | 공용 fetch 래퍼(토큰 첨부/refresh) |
| `apps/web/styles/globals.css` | Tailwind + OKLch 디자인 토큰 |

### 프론트 토픽 도메인

| 파일 | 역할 |
|---|---|
| `apps/web/app/topics/domains/index.ts` | topicDomains (getAllPosts, getLatestPostsByTag, getHotPostsByTag, searchPosts, parseSortSearchParams) |
| `apps/web/app/topics/domains/constants.ts` | TAG_MAP, CATEGORY_FILTERS |
| `apps/web/app/topics/features/use-infinite-topics.ts` | 토픽 무한스크롤 훅 |
| `apps/web/app/topics/features/use-create-post.ts` | 토픽 작성 뮤테이션 |
| `apps/web/app/topics/widgets/topicCard.tsx` | 토픽 카드(전역 재사용: 홈/검색/마이/피드) |
| `apps/web/app/topics/widgets/topicsContent.tsx` | RSC: HOT + 최신 섹션 조합 |
| `apps/web/app/topics/widgets/topicList.tsx` | 클라 무한스크롤 리스트 |
| `apps/web/app/topics/widgets/categoryFilter.tsx` | 카테고리 탭(가로 스크롤 pill) |
| `apps/web/app/topics/[id]/page.tsx` | 토픽 상세 |
| `apps/web/app/topics/create/` | 토픽 작성 페이지 |

### 기타 라우트

| 파일 | 역할 |
|---|---|
| `apps/web/app/search/page.tsx` | 탐색 페이지 (검색바 + 카테고리 그리드 + 인기토픽) |
| `apps/web/app/my/page.tsx` | 마이페이지 (내 토픽 / 내 투표 탭) |
| `apps/web/app/users/[id]/page.tsx` | 타 유저 공개 프로필 |
| `apps/web/app/feed/widgets/*` | 홈/피드 섹션 컴포넌트 모음 (현재 `/`에서 일부 사용) |
| `apps/web/app/notifications/page.tsx` | 알림 (스텁) |

### 백엔드 진입점 & 설정

| 파일 | 역할 |
|---|---|
| `apps/api/src/main.ts` | Nest 부트스트랩 |
| `apps/api/src/app.module.ts` | 루트 모듈 (Post/Comment/Vote/Auth/User/Follow/Summary 등록) |
| `apps/api/src/config/database.config.ts` | TypeORM 설정 |
| `apps/api/src/data-source.ts` | CLI용 DataSource (마이그레이션) |
| `apps/api/src/entities/index.ts` | 엔티티 배럴 |

### 백엔드 피처 모듈 핵심

| 파일 | 역할 |
|---|---|
| `apps/api/src/post/post.controller.ts` | `GET /api/posts/{recent,search,tags/:tag,:id,:id/vote-count}`, `POST /create`, `PATCH/DELETE :id` |
| `apps/api/src/post/post.service.ts` | 토픽 CRUD + 검색(QueryBuilder, ILIKE) + 페이지네이션 |
| `apps/api/src/post/dto/{create-post,update-post,post-query,pagination-query,search-query}.dto.ts` | DTO들 |
| `apps/api/src/vote/vote.controller.ts` / `vote.service.ts` | 투표 생성·변경, VoteHistory 적재, Post 카운트 증감 |
| `apps/api/src/comment/` | 댓글 CRUD + 좋아요 |
| `apps/api/src/user/user.controller.ts` | `/users/me/{posts,votes}`, `PATCH /users/me`, `/users/:id/{profile,posts,comments}` |
| `apps/api/src/auth/auth.controller.ts` | Kakao OAuth 콜백, 토큰 refresh |
| `apps/api/src/auth/guards/jwt-auth.guard.ts` | **유일한 가드 (Role 가드 없음)** |
| `apps/api/src/follow/follow.controller.ts` | 팔로우/언팔로우 |
| `apps/api/src/summary/summary.service.ts` | AI 요약 |

### 공용 타입

| 파일 | 역할 |
|---|---|
| `packages/shared-types/src/enums.ts` | PostTag, VoteStatus, PostSortBy, SortOrder |
| `packages/shared-types/src/post.ts` | PostResponse, CreatePost 등 |
| `packages/shared-types/src/vote.ts` | VoteResponse, VoteHistoryResponse |
| `packages/shared-types/src/api-response.ts` | ApiResponse, PaginatedResponse |
| `packages/shared-types/src/errors.ts` | ErrorCode enum |

---

## 작업별 분석

### [2026-04-03] 검색/탐색 페이지 UI 개선 (레거시)

(요약) 검색 페이지 기본 UI(SearchBar, CategoryGrid, 인기토픽) 완료. 텍스트 검색 API는 이후 2026-04-06에 구현됨. 디자인 토큰/섹션 헤더 패턴/카테고리 필터 패턴 등 세부는 본 파일 이전 버전 기준 일관성 유지.

주요 파일:
- `apps/web/app/search/page.tsx`, `apps/web/app/search/widgets/{searchBar,categoryGrid}.tsx`
- 재사용: `apps/web/app/topics/widgets/{topicCard,topicsContent,categoryFilter}.tsx`

### [2026-04-06] 검색 API 백엔드 구현

#### Post 엔티티 주요 필드
- `title` varchar(100) — 검색 대상
- `content` text — 검색 대상
- `creator` ManyToOne(User) — leftJoin으로 nickname 접근
- `deletedAt` — soft delete, WHERE IS NULL 필수
- `popularityScore` float (Index) — 인기순 정렬
- `createdAt` — 최신순 기본

#### 구현 포인트
- `createQueryBuilder` + `leftJoinAndSelect('post.creator', 'creator')`
- OR 조건(title/content/nickname) + ILIKE (PostgreSQL)
- 라우팅 순서: `recent` → `search` → `tags/:tag` → `:id` (충돌 방지)
- `SearchType` enum: `ALL` / `CONTENT` / `AUTHOR`
- `q`는 필수(`MinLength(1)`)
- `ResponseWithMeta(items, { total, page, limit, totalPages })`로 반환

### [2026-04-10] 마이페이지 내 투표 목록 디자인

- `VoteResponse`: id, postId, userId, currentStatus, changeCount, firstVotedAt, lastChangedAt
- `VoteStatus`: AGREE | DISAGREE | NEUTRAL
- Vote 엔티티: postId+userId Unique, history OneToMany(VoteHistory)
- **CreateVoteDto에 comment/의견 필드 없음** — 투표 시 코멘트 기능 부재
- `GET /api/users/me/votes` → `PaginatedResponse<MyVoteResponse>` (post + post.creator 포함), `firstVotedAt DESC` 고정, 필터/정렬 파라미터 미지원
- `MyVotesTab`: `TopicCard + myVote=currentStatus`. footer 우측 11px 텍스트로만 "내 선택" 표시 — 강조 필요
- 디자인 시스템: 4px spacing, rounded-xl 카드, border-only(overlay만 shadow), OKLch opinion 컬러(agree/disagree/neutral), Pretendard

### [2026-04-13] 메인 페이지 투표 피드 전환 분석

#### 1. 현재 메인 페이지가 실제로 보여주는 것

`apps/web/app/page.tsx`는 **유저 목록이 아니라 토픽(게시글) 피드**이다.

```tsx
// apps/web/app/page.tsx
<CategoryFilter ... />
<Suspense fallback={<TopicsListSkeleton />}>
  <TopicsContent selectedTag={selectedTag} selectedSort={selectedSort} />
</Suspense>
```

- 상단 sticky 영역: `CategoryFilter` (가로 스크롤 pill 탭: 전체/정치/사회/경제/기술/연예/스포츠/기타)
- 본문: `TopicsContent` (RSC) — `tag === "all"`이면 `getAllPosts()` 인기순, 그 외엔 `getHotPostsByTag()` + `getLatestPostsByTag()` 조합
- 카드: 공용 `TopicCard` (topics/widgets)
- URL: `/?tag=politics&sort=recent` 형태, `/topics`는 홈으로 리다이렉트

즉 사용자가 "유저 목록이 메인"으로 인식한 것은 **오해**이며, 실제로는 이미 **토픽 피드**다. 유저 목록 전용 메인 페이지는 존재하지 않고, 유저 관련 화면은 `/users/[id]` 공개 프로필 뿐이다.

#### 2. 관리자 역할(role) 체계

**현재 없음.**

- `apps/api/src/entities/user.entity.ts`의 User에 `role`, `isAdmin`, `permissions` 등 어떤 관리자 플래그도 없다. 필드 전부: `id, kakaoId, nickname, profileImageUrl, createdAt, updatedAt, deletedAt` + relations.
- `shared-types`의 enums에도 `UserRole` 없음.
- 백엔드 가드도 `JwtAuthGuard` 하나뿐, `RolesGuard`/`AdminGuard` 등 없음.
- 현재 토픽 작성은 `POST /api/posts/create`에 `JwtAuthGuard`만 붙어 있어 **로그인한 누구나** 작성 가능(`apps/api/src/post/post.controller.ts:46-50`).

따라서 "관리자만 메인 투표를 올린다"는 정책은 신규로 구축 필요.

#### 3. 기존 Post/Vote 모델 재사용 가능성

Post 엔티티는 이미 투표 피드에 필요한 필드를 전부 보유:
- `title`, `content`, `tag`, `showCreatorOpinion`, `agreeCount/disagreeCount/neutralCount`, `commentCount`, `viewCount`, `popularityScore`, soft delete
- Vote/VoteHistory도 1인 1투표 + 변경 이력 완비

**권장**: 별도 "AdminVote" 엔티티를 새로 만들지 말고, **기존 Post 엔티티에 관리자/피쳐드 구분 필드를 추가**하는 것이 최소 변경으로 충분하다. 이유:
- 투표/댓글/검색/마이페이지 전부 이미 Post 기반으로 붙어 있어 재사용성 극대화
- TopicCard, VoteButtons, CommentList 등 UI 컴포넌트 그대로 사용 가능
- 필터로 "관리자 올린 것만" 구분 가능

대안 (분리형)은 오버엔지니어링 위험.

#### 4. "관리자 투표 피드" 전환 시 필요한 변경점

**DB / 엔티티**
- `User`에 `role` 컬럼 추가 (`enum UserRole { USER, ADMIN }`, default USER)
  - 또는 최소안: `isAdmin: boolean` 컬럼
- (선택) `Post`에 `isOfficial: boolean` 또는 `isFeatured: boolean` 컬럼 추가 — 메인 피드에서 노출할 "공식 투표"만 필터링하기 위함
  - 이유: 관리자가 일반 토픽과 구분되는 "대표 투표"만 메인에 올리고 싶을 수 있음. role만으로 필터할 수도 있으나, 관리자가 일반 토픽도 올릴 가능성이 있으니 플래그가 안전.
- `shared-types/src/enums.ts`에 `UserRole` 추가, `post.ts`에 `isOfficial` 반영

**백엔드 (`apps/api`)**
- `common/decorators/roles.decorator.ts` + `common/guards/roles.guard.ts` 신설 (NestJS 표준 패턴)
- `@Roles(UserRole.ADMIN)` + `@UseGuards(JwtAuthGuard, RolesGuard)` 조합
- `POST /api/posts/create` 현행 유지(일반 사용자용)하거나, 별도 `POST /api/posts/official` 엔드포인트 신설 (관리자 전용, `isOfficial=true`로 저장)
- 조회: `GET /api/posts/official?page=...` 신설 또는 기존 `PostQueryDto`에 `isOfficial` 쿼리 추가
- 최초 관리자 지정: 마이그레이션 스크립트 또는 수동 SQL로 특정 kakaoId/nickname의 role을 ADMIN으로 세팅

**프론트엔드 (`apps/web`)**
- `app/page.tsx`의 데이터 소스를 `topicDomains.getAllPosts()` → 신규 `getOfficialPosts()`로 교체
- `topicDomains`에 `getOfficialPosts()` 추가 (또는 기존 함수에 `isOfficial` 옵션)
- 카테고리 필터는 유지하되, 쿼리 조건에 `isOfficial=true` 상수 고정
- 관리자 전용 작성 화면: `/admin/topics/create` 또는 기존 `/topics/create`에서 role 체크 후 `isOfficial` 토글 노출
- `auth-context`에 `user.role` 포함되도록 타입/응답 확장
- 탭바의 FAB(글쓰기)는 일반 유저용 유지, 관리자에게만 별도 진입점 노출(또는 동일 화면에서 체크박스)

**라우팅 전략 (두 가지 선택지)**

A. 홈만 "관리자 투표 피드"로 바꾸고, 일반 유저 토픽은 탐색/검색으로 밀어 넣기
  - `/` = 관리자 공식 투표 피드
  - `/search` 또는 `/community` = 일반 유저 토픽
  - 변경 범위 큼, 사이트 성격 자체가 바뀜

B. 홈 상단에 "공식 투표" 섹션, 하단에 "커뮤니티 토픽" 섹션을 병행
  - 변경 범위 작음, 기존 UX 유지
  - `app/feed/widgets/`의 섹션 컴포넌트 패턴과 궁합 좋음

사용자의 의도("메인을 관리자 투표 피드로 바꾸고 싶다")를 정확히 확인 후 A/B 결정 필요.

#### 5. 요약

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
- 현재 메인은 토픽 피드(사용자가 올린 Post 목록)이며, 유저 목록이 아니다.
- User 엔티티에 role 필드 없음 → 관리자 체계는 0부터 구축 필요.
- Post/Vote 엔티티는 그대로 재사용 가능. 신규 "관리자 투표" 엔티티 분리는 불필요, `User.role` + `Post.isOfficial` 플래그 추가가 최소/안전한 방향.
- 가드는 `RolesGuard`를 신설해 작성/수정 API에 role 체크를 덧붙이는 것이 NestJS 컨벤션.
