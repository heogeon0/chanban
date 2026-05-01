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

- 현재 메인은 토픽 피드(사용자가 올린 Post 목록)이며, 유저 목록이 아니다.
- User 엔티티에 role 필드 없음 → 관리자 체계는 0부터 구축 필요.
- Post/Vote 엔티티는 그대로 재사용 가능. 신규 "관리자 투표" 엔티티 분리는 불필요, `User.role` + `Post.isOfficial` 플래그 추가가 최소/안전한 방향.
- 가드는 `RolesGuard`를 신설해 작성/수정 API에 role 체크를 덧붙이는 것이 NestJS 컨벤션.
