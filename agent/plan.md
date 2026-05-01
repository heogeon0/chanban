# v3 디자인 개편 Plan

## v1. TopicCard 리스타일

- [x] a: `topicCard.tsx` — 최외곽 `Link`의 className을 `block px-4 py-4 hover:bg-muted/30 transition-colors`에서 `block rounded-2xl border border-border p-4 mx-3 my-2 transition-colors hover:bg-muted/10`으로 교체해 카드 래퍼 스타일 적용
- [x] b: `topicCard.tsx` — 카테고리 `<span className="text-xs font-semibold text-primary">` 를 `<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">`으로 교체해 필(fill) 뱃지 적용
- [x] c: `topicCard.tsx` — 제목 `<h3>` className을 `text-sm font-bold` → `text-[15px] font-semibold`로 변경
- [x] d: `topicCard.tsx` — 찬반 분포 영역에서 `<div className="flex justify-between text-[10px] ...">` 퍼센트 텍스트 행 전체 제거 (바 내부로 통합)
- [x] e: `topicCard.tsx` — 투표 바 `<div className="flex h-1.5 w-full rounded-full overflow-hidden bg-muted">` 의 `h-1.5`를 `h-[28px]`로 변경, 각 내부 `div`에 `flex items-center justify-center text-[10px] font-bold text-white` 추가 및 MIN_DISPLAY_WIDTH(15) 조건으로 `{agreePercent >= 15 && `${agreePercent}%`}` 형태 퍼센트 텍스트 삽입
- [x] f: `topicCard.tsx` — 하단 메타 영역에서 `myVote` 배지의 아이콘(`Icon`) 제거, 텍스트만 유지 (`내 선택: {label}`)

## v2. VoteButtons 리스타일

- [x] a: `voteButtons.tsx` — 최외곽 래퍼 `flex flex-col sm:flex-row gap-4` → `flex gap-2`로 변경 (항상 가로 배치)
- [x] b: `voteButtons.tsx` — 찬성 버튼: 미선택 시 `flex-1 h-12 rounded-xl bg-opinion-agree/15 text-opinion-agree font-extrabold text-[15px]`, 선택 시 `bg-opinion-agree text-white shadow-lg shadow-opinion-agree/30`으로 분기. 기존 아이콘, `py-6`, `flex-col` 제거
- [x] c: `voteButtons.tsx` — 반대 버튼: 미선택 시 `flex-1 h-12 rounded-xl bg-opinion-disagree/15 text-opinion-disagree font-extrabold text-[15px]`, 선택 시 `bg-opinion-disagree text-white shadow-lg shadow-opinion-disagree/30`으로 분기
- [x] d: `voteButtons.tsx` — 중립 버튼: `flex-1` → `flex-[0.7]`, 미선택 시 `h-12 rounded-xl bg-muted text-muted-foreground font-bold text-[14px]`, 선택 시 `bg-muted-foreground text-white`
- [x] e: `voteButtons.tsx` — `ThumbsUp`, `ThumbsDown`, `Scale` 아이콘 JSX 및 import 전부 삭제
- [x] f: `voteButtons.tsx` — 선택 상태 ring 클래스 (`selectedRingClass`) 변수 제거

## v3. VoteDistributionBar + TopicDetailContent 통합 레이아웃

- [x] a: `voteDistributionBar.tsx` — props에 `hasVoted?: boolean` 추가, 최외곽 div에 `transition-opacity duration-300` 및 `hasVoted ? "opacity-100" : "opacity-50"` 조건 클래스 적용
- [x] b: `voteDistributionBar.tsx` — 바 높이 `h-10` → `h-8`로 변경, `rounded-full` → `rounded-lg`로 변경
- [x] c: `voteDistributionBar.tsx` — 범례(`flex justify-center gap-8 mt-4`) 블록 제거
- [x] d: `topicDetailContent.tsx` — 투표 섹션 래퍼 `<section className="bg-card border border-border rounded-xl p-6 desktop:p-8 shadow-sm">` 의 카드 스타일 제거, `<section className="px-5 py-4">`로 평탄화
- [x] e: `topicDetailContent.tsx` — `"투표하기"` 헤더 `<h3 ...>` 제거
- [x] f: `topicDetailContent.tsx` — `VoteDistributionBar` 렌더 위치를 `VoteButtons` 위로 이동, `hasVoted={!!myVote?.currentStatus}` prop 전달
- [x] g: `topicDetailContent.tsx` — `space-y-12` → `space-y-0`으로 변경, 각 섹션 사이 `<div className="h-2 bg-muted -mx-4" />` 구분선 추가

## v4. Comment 리스타일 (컬러바 + 아바타 교체)

- [x] a: `comment.tsx` — 원댓글 정상 렌더 최외곽 `<div className="flex gap-4">` 구조를 `<div className="flex gap-0">` + 좌측 4px 컬러바 `<div className="w-1 rounded-l-xl shrink-0" style={{ backgroundColor: stanceColor }}>` + 콘텐츠 `<div className="flex-1 p-3 rounded-r-xl border border-l-0 border-border">`로 변경
- [x] b: `comment.tsx` — `latestVote` 기반 stanceColor 헬퍼 추가: `agree` → `text-opinion-agree` 계열, `disagree` → `text-opinion-disagree`, 나머지 → muted
- [x] c: `comment.tsx` — `<Link href={...}><UserAvatar ... /></Link>` 아바타 블록 전체 제거, 헤더에 닉네임 첫 글자 원형 배지 `<span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-white shrink-0">{comment.user.nickname.charAt(0)}</span>` 추가 (stanceColor 배경으로 동적 처리)
- [x] d: `comment.tsx` — `VoteHistoryBadge` 스타일이 pill 형태인지 확인, 현재 스타일 유지 (commentUtils.tsx는 수정 불필요)
- [x] e: `comment.tsx` — 대댓글 목록 래퍼 `mt-4 ml-5 border-l-2 border-border pl-4` → `ml-5 mt-1.5 space-y-1.5`로 변경 (border-l 제거, ReplyComment 자체에 컬러바 있음)
- [x] f: `comment.tsx` — 답글 작성 폼 래퍼 `mt-4 ml-14` → `mt-3 ml-5`로 인덴트 조정

## v5. ReplyComment 리스타일 (컬러바 + 아바타 교체)

- [x] a: `replyComment.tsx` — 정상 렌더 최외곽 `<div className="flex gap-3">` 구조를 `<div className="flex gap-0">` + 3px 컬러바 `<div className="w-[3px] rounded-l-lg shrink-0 opacity-60" style={{ backgroundColor: stanceColor }}>` + 콘텐츠 `<div className="flex-1 px-3 py-2.5 rounded-r-lg border border-l-0 border-border">`로 변경
- [x] b: `replyComment.tsx` — `<Link href={...}><UserAvatar ... /></Link>` 아바타 블록 전체 제거
- [x] c: `replyComment.tsx` — 헤더에 닉네임 첫 글자 원형 배지 `<span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0" style={{ backgroundColor: stanceColor }}>{reply.user.nickname.charAt(0)}</span>` 추가

## v6. AiSummarySection 그라데이션 적용

- [x] a: `aiSummarySection.tsx` — 카드 최외곽 section/div의 배경을 `bg-gradient-to-br from-[#EEF4FF] to-[#F5F0FF] border border-[#E0E7FF] dark:from-[#1a1a2e] dark:to-[#1a1525] dark:border-[#2c2c3e]`로 교체
- [x] b: `aiSummarySection.tsx` — 헤더 아이콘을 `Sparkles` (lucide-react)로 교체, 색상 `text-violet-500`
- [x] c: `aiSummarySection.tsx` — `AiSummarySkeleton`의 최외곽 section에도 동일 그라데이션 className 적용

## v7. BottomTabBar 5탭 확장

- [x] a: `bottom-tab-bar.tsx` (경로 확인 필요) — `TABS` 배열에 탐색 탭 `{ label: "탐색", href: "/explore", icon: Search }` 추가 (홈과 글쓰기 사이)
- [x] b: `bottom-tab-bar.tsx` — `TABS` 배열에 알림 탭 `{ label: "알림", href: "/notifications", icon: Bell }` 추가 (글쓰기와 마이 사이)
- [x] c: `bottom-tab-bar.tsx` — 글쓰기 탭을 FAB 스타일로: 아이콘 래퍼를 `bg-primary text-primary-foreground rounded-full p-3 -mt-4 shadow-lg shadow-primary/30`으로 감싸기
- [x] d: `apps/web/app/explore/page.tsx` — `/explore` 라우트 플레이스홀더 페이지 생성
- [x] e: `apps/web/app/notifications/page.tsx` — `/notifications` 라우트 플레이스홀더 페이지 생성

## v8. 검색 페이지 기본 UI

- [x] a: `apps/web/app/search/page.tsx` — RSC, 카테고리 그리드 + 인기 토픽 피드
- [x] b: `apps/web/app/search/widgets/searchBar.tsx` — 포커스 인터랙션, 취소 버튼
- [x] c: `apps/web/app/search/widgets/categoryGrid.tsx` — 7개 카테고리 그라데이션 카드
- [x] d: `bottom-tab-bar.tsx` — 탐색 탭 href `/topics` → `/search` 변경

## v8-ui. 검색 프론트 임시 UI (백엔드 연동 전)

> **원칙**: 기존 디자인 컴포넌트를 최대한 재사용. 신규 컴포넌트는 꼭 필요한 것만 만든다.

### 재사용할 기존 컴포넌트
- `TopicCard` (`apps/web/app/topics/widgets/topicCard.tsx`) — 검색 결과 카드 그대로 사용
- `TopicsListSkeleton` (`apps/web/app/topics/widgets/topicsListSkeleton.tsx`) — 로딩 중 스켈레톤
- `CategoryGrid` (`apps/web/app/search/widgets/categoryGrid.tsx`) — 검색 결과 없을 때 하단 노출
- `SearchBar` (`apps/web/app/search/widgets/searchBar.tsx`) — 기존 컴포넌트 확장

### 신규로 필요한 컴포넌트
- `SearchResults` (`apps/web/app/search/widgets/searchResults.tsx`) — 검색 결과 / 빈 상태 / 에러 분기 렌더러
- `SearchEmptyState` — `SearchResults` 내부 인라인 컴포넌트로 처리 (별도 파일 불필요)

### 작업 항목
- [x] a: `apps/web/app/search/widgets/searchResults.tsx` (신규) — `isLoading` 시 `TopicsListSkeleton` 재사용, 결과 있을 때 `TopicCard` 목록, 빈 상태일 때 `<SearchX />` 아이콘 + 안내 문구 + `CategoryGrid` 노출
- [x] b: `apps/web/app/search/widgets/searchBar.tsx` — `onQueryChange: (q: string) => void` prop 추가, debounce(300ms) 적용, 입력 중 `<Loader2 className="animate-spin" />` 표시 (Search 아이콘 대체)
- [x] c: `apps/web/app/search/page.tsx` — `"use client"` 전환, `query` 상태 관리. query 없으면 `CategoryGrid + HotTopicsFeed`, query 있으면 `SearchResults` (isLoading=true 고정, 실제 데이터 없이 UI 흐름만 완성)

## v9. 백엔드 텍스트 검색 API

> Post 엔티티: title(varchar 100), content(text), creator.nickname(varchar). QueryBuilder + ILIKE 사용.
> 라우팅 순서 주의: `recent` → `search` → `tags/:tag` → `:id` 순으로 배치해야 충돌 없음.

- [x] a: `apps/api/src/post/dto/search-query.dto.ts` (신규) — `PostQueryDto` 상속, `q: string` (필수, MinLength 1, MaxLength 200), `type?: SearchType = 'all'` 추가. `SearchType` enum: `ALL='all'`, `CONTENT='content'`, `AUTHOR='author'`
- [x] b: `apps/api/src/post/post.service.ts` — `searchPosts(dto: SearchQueryDto)` 메서드 추가. `createQueryBuilder('post').leftJoinAndSelect('post.creator', 'creator')` 기반. type에 따라 WHERE 분기: `all`→ title+content+nickname ILIKE, `content`→ title+content ILIKE, `author`→ nickname ILIKE. sort/order/skip/take는 기존 패턴 동일. `getManyAndCount()` → `ResponseWithMeta` 반환
- [x] c: `apps/api/src/post/post.controller.ts` — `@Get('search')` 엔드포인트 추가. 위치: `@Get('recent')` 바로 아래, `@Get('/tags/:tag')` 위. 인증 없이 공개 접근

## v10. 프론트 검색 도메인 & React Query 레이어

> 기존 topicDomains, topicQueries, queryKeys 패턴 그대로 유지.

- [x] a: `apps/web/app/topics/domains/index.ts` — `searchPosts(q, type='all', page=1)` 추가. `URLSearchParams`로 쿼리 문자열 생성. `topicDomains` 객체에 병합
- [x] b: `apps/web/shared/queries/keys.ts` — `topic.search: (q, type='all') => ["topics", "search", q, type]` 추가
- [x] c: `apps/web/shared/queries/topic.ts` — `topicQueries.search(q, type, page)` 추가. queryFn에서 `topicDomains.searchPosts` 호출
- [x] d: `apps/web/app/search/features/use-search-topics.ts` (신규) — `enabled: q.trim().length >= 1`, `staleTime: 30_000`, `placeholderData: (prev) => prev` (타이핑 중 이전 결과 유지, 깜빡임 방지)

## v11. SearchBar 검색 연동 + 결과 표시

- [x] a: `apps/web/app/search/widgets/searchBar.tsx` — debounce(300ms) 적용, 입력 중 `<Loader2 animate-spin />` 표시
- [x] b: `apps/web/app/search/widgets/searchResults.tsx` (신규) — 로딩 스켈레톤 / 빈 상태 / 결과 리스트 렌더링
- [x] c: `apps/web/app/search/page.tsx` — query 상태에 따라 HotFeed ↔ SearchResults 조건부 렌더링

## v12. 최근 검색 기록 (localStorage)

- [x] a: `apps/web/app/search/features/use-recent-searches.ts` (신규) — 키 `chanban:recent-searches`, 최대 10개, SSR 안전 처리
- [x] b: `apps/web/app/search/widgets/recentSearches.tsx` (신규) — 검색어 태그 목록, 개별 삭제, 전체 삭제
- [x] c: `apps/web/app/search/widgets/searchContent.tsx` — 검색 실행 시 `addSearch(query)` 호출
- [x] d: `apps/web/app/search/widgets/searchContent.tsx` — query 없을 때 인기 피드 위에 RecentSearches 배치

## v13. 검색 결과 UX 개선

- [x] a: `apps/web/app/search/widgets/searchResults.tsx` — 에러 상태: `<AlertCircle />` + 재시도 버튼
- [x] b: `apps/web/app/search/widgets/searchResults.tsx` — 빈 상태: `<SearchX />` + `"{query}"에 대한 결과가 없습니다`
- [x] c: `apps/web/app/search/widgets/searchResults.tsx` — 결과 상단에 `"{query}" 검색 결과 · {total}건` 요약 표시

## v14. 투표 전용 컴팩트 카드 (MyVoteCard)

> TopicCard 재사용 대신 마이페이지 전용 레이아웃. 내 투표 상태를 배지로 강조하고, 다수/소수 의견 인사이트 표시.
> 참고: comment.tsx 좌측 컬러바 패턴, VoteBadge 컴포넌트 재사용.

- [x] a: `apps/web/app/my/widgets/myVoteCard.tsx` (신규) — 순수 UI 컴포넌트. Props: `{ vote: MyVoteResponse, majorityStatus?: 'majority' | 'minority' | 'tie' }`. 구조: 좌측 4px 컬러바(투표 상태별 opinion-agree/disagree/neutral) + 우측 카드 본문. 컬러바는 comment.tsx의 `w-1 rounded-l-xl shrink-0` 패턴 동일 적용
- [x] b: `apps/web/app/my/widgets/myVoteCard.tsx` — 카드 헤더: 투표 상태 배지(`rounded-full px-2 py-0.5 text-xs font-medium`, bg-opinion-agree/10 text-opinion-agree 등) + 다수/소수 인사이트 배지(다수 의견이면 `bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400`, 소수면 `bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400`) + 투표 시각(`formatRelativeTime(vote.firstVotedAt)`)
- [x] c: `apps/web/app/my/widgets/myVoteCard.tsx` — 카드 본문: 토픽 제목(`text-[15px] font-semibold line-clamp-2`) + 축소된 찬반 바(`h-2 rounded-full`, 텍스트 없이 비율만 표시) + footer(투표수 + 댓글수, `text-[11px] text-muted-foreground`). 전체를 `Link href={/topics/${vote.post.id}}`로 감싸기

## v15. 투표 필터 칩 (클라이언트 사이드)

> API 필터 미지원 → 클라이언트에서 allVotes를 currentStatus로 필터링.
> categoryFilter.tsx의 pill 버튼 패턴 참고, 단 Link 대신 button + state 기반.

- [x] a: `apps/web/app/my/widgets/voteFilter.tsx` (신규) — 순수 UI 컴포넌트. Props: `{ value: VoteStatus | 'all', onChange: (v: VoteStatus | 'all') => void, counts: { all: number, agree: number, disagree: number, neutral: number } }`. 가로 스크롤 pill 버튼 4개(전체/찬성/반대/중립). 활성: `bg-primary text-primary-foreground`, 비활성: `bg-muted text-muted-foreground`. 각 버튼에 건수 표시(`전체 24`)
- [x] b: `apps/web/app/my/widgets/myVotesTab.tsx` — `useState<VoteStatus | 'all'>('all')` 필터 상태 추가. allVotes에서 filter !== 'all'이면 `vote.currentStatus === filter`로 필터링. VoteFilter를 목록 상단에 배치. counts는 allVotes에서 reduce로 집계
- [x] c: `apps/web/app/my/widgets/myVotesTab.tsx` — 다수/소수 인사이트 계산 로직 추가. 각 vote에 대해 `vote.post`의 agreeCount/disagreeCount/neutralCount에서 내 투표가 최다 득표인지 판별 → `majorityStatus` prop으로 MyVoteCard에 전달

## v16. MyVotesTab TopicCard → MyVoteCard 교체

> 기존 TopicCard 렌더링을 MyVoteCard로 교체하고, 필터 + 인사이트 통합.

- [x] a: `apps/web/app/my/widgets/myVotesTab.tsx` — import를 `TopicCard` → `MyVoteCard`로 변경. `allVotes.map(vote => <MyVoteCard vote={vote} majorityStatus={getMajorityStatus(vote)} />)` 형태로 교체
- [x] b: `apps/web/app/my/widgets/myVotesTab.tsx` — 스켈레톤을 MyVoteCard 레이아웃에 맞게 수정: 좌측 컬러바(w-1) + 우측 카드(배지 + 제목 + 축소바 + footer) 형태의 pulse 애니메이션
- [x] c: `apps/web/app/my/widgets/myVotesTab.tsx` — 빈 상태 개선: 필터 적용 중일 때 "{찬성|반대|중립} 투표가 없습니다.", 전체 비었을 때 기존 메시지 유지

## v17. 탭 3개 확장 (내 투표 | 내 의견 | 내 토픽)

> 기존 2탭 → 3탭. "내 의견" 탭은 내가 남긴 댓글 목록 표시.
> 댓글 API: `GET /api/users/:id/comments` 이미 존재. user-comments-tab.tsx 패턴 참고하되, 마이페이지용 무한스크롤로 개선.
> 주의: userQueries.userComments는 userId를 받으므로, 마이페이지에서는 useAuth()로 user.id 획득 필요.

- [x] a: `apps/web/app/my/features/use-infinite-my-comments.ts` (신규) — `useInfiniteQuery` 기반, `userQueries.userComments(userId, pageParam)` 활용. `useAuth().user.id` 사용. 기존 use-infinite-my-votes.ts 패턴 동일
- [x] b: `apps/web/app/my/widgets/myCommentsTab.tsx` (신규) — user-comments-tab.tsx의 CommentCard를 마이페이지 디자인에 맞게 조정: `rounded-2xl` 카드 + 좌측 컬러바(투표 상태) + 댓글 내용 + 원글 제목 배지 + 좋아요 수 + 시간. 무한스크롤 적용
- [x] c: `apps/web/app/my/page.tsx` — TabType을 `'votes' | 'comments' | 'topics'`로 확장. 탭 버튼 3개로 변경("내 투표 목록" / "내 의견" / "내 토픽 목록"). 조건부 렌더링에 `activeTab === 'comments' ? <MyCommentsTab /> : ...` 추가
- [x] d: `apps/web/app/my/page.tsx` — 프로필 통계에 댓글 수 추가: `userQueries.userComments(user.id, 1)` 쿼리로 `meta.total` 획득, ProfileSection에 전달 (백엔드 변경 불필요)

## v18. shared-types & 엔티티 확장 (UserRole / isOfficial)

- [x] a: `packages/shared-types/src/enums.ts` — `UserRole` enum 추가 (`USER = 'user'`, `ADMIN = 'admin'`). export 배럴(`index.ts`) 확인 후 재노출
- [x] b: `packages/shared-types/src/user.ts` (또는 user 타입이 선언된 파일) — `UserResponse`/공용 User 타입에 `role: UserRole` 필드 추가. 없으면 `apps/api`와 `apps/web`이 의존하는 사용자 응답 타입 위치 확인 후 반영
- [x] c: `packages/shared-types/src/post.ts` — `PostResponse` / `CreatePostRequest` 타입에 `isOfficial: boolean` 필드 추가 (CreatePost는 optional, 응답은 required default false)
- [x] d: `apps/api/src/entities/user.entity.ts` — `@Column({ type: 'enum', enum: UserRole, default: UserRole.USER }) role: UserRole` 컬럼 추가. import는 `@repo/shared-types`에서
- [x] e: `apps/api/src/entities/post.entity.ts` — `@Column({ type: 'boolean', default: false }) @Index() isOfficial: boolean` 컬럼 추가 (공식 피드 필터 성능을 위해 인덱스)

## v19. TypeORM 마이그레이션 (SKIPPED)

- [x] a: 스킵 — `data-source.ts`가 `synchronize: true`라 엔티티 변경 시 자동 DDL 적용됨. 별도 마이그레이션 파일 불필요.
- [x] b: 스킵 (동일)
- [x] c: 최초 관리자 지정은 추후 별도 SQL/스크립트로 처리 (본 작업 범위 밖)

## v20. 백엔드 Role 가드 + 공식 투표 API

- [x] a: `apps/api/src/common/decorators/roles.decorator.ts` (신규) — `export const ROLES_KEY = 'roles'; export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);`
- [x] b: `apps/api/src/common/guards/roles.guard.ts` (신규) — `Reflector`로 메타데이터 조회, `request.user.role`이 포함되는지 체크. `JwtAuthGuard` 뒤에 chain되는 전제
- [x] c: `apps/api/src/auth/strategies/jwt.strategy.ts` — 수정 불필요. 기존 validate가 `userService.findById`로 full user 조회해 반환하므로 User 엔티티에 추가된 `role` 필드가 자동 포함됨
- [x] d: `apps/api/src/post/dto/create-post.dto.ts` — `@IsOptional() @IsBoolean() isOfficial?: boolean` 추가
- [x] e: `apps/api/src/post/dto/post-query.dto.ts` — `@IsOptional() @Type(() => Boolean) isOfficial?: boolean` 추가 (목록 조회 필터)
- [x] f: `apps/api/src/post/post.service.ts` — `createPost`에서 `isOfficial` 저장 처리. 단, `isOfficial=true` 요청은 서비스에서 재검증(관리자인지)하거나 컨트롤러 단에서 가드로만 제어. 목록 조회(`findAll`/`getRecentPosts`)에 `isOfficial` 필터 옵션 추가
- [x] g: `apps/api/src/post/post.controller.ts` — 공식 투표 작성 전용 엔드포인트 `POST /api/posts/official` 신설: `@UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)`, 본문은 `CreatePostDto`이되 서비스에서 `isOfficial=true` 강제. 기존 `POST /api/posts/create`는 `isOfficial`을 무시하고 항상 false로 저장(일반 사용자용)
- [x] h: `apps/api/src/post/post.controller.ts` — `GET /api/posts/official` 신설: 공식 투표만 페이지네이션 반환. 라우팅 순서 `recent` → `search` → `official` → `tags/:tag` → `:id` 유지
- [x] i: `/users/me`는 존재하지 않음 — 대신 `/auth/me`가 `@CurrentUser() user: User`를 그대로 반환. User 엔티티에 role이 추가되어 자동 포함됨

## v21. 프론트 데이터 레이어 (official posts)

- [x] a: `apps/web/app/topics/domains/index.ts` — `getOfficialPosts(page=1, limit=20)` 추가. `/api/posts/official?page=...` 호출. `topicDomains` 객체에 병합
- [x] b: `apps/web/app/topics/domains/index.ts` — `createOfficialPost(dto)` 추가. `POST /api/posts/official` 호출 (관리자 전용)
- [x] c: `apps/web/shared/queries/keys.ts` — `topic.official: (page) => ["topics", "official", page]` 및 `topic.officialInfinite: () => ["topics", "official", "infinite"]` 추가
- [x] d: `apps/web/shared/queries/topic.ts` — `topicQueries.official(page)` 추가. queryFn은 `topicDomains.getOfficialPosts`
- [x] e: `apps/web/app/features/use-infinite-official-posts.ts` 또는 `apps/web/app/topics/features/use-infinite-official-posts.ts` (신규) — `useInfiniteQuery` 기반, 기존 `use-infinite-topics.ts` 패턴 복제
- [x] f: `apps/web/shared/contexts/auth-context.tsx` — `user` 타입에 `role: UserRole` 반영, `isAdmin` 헬퍼 getter 제공 (`user?.role === UserRole.ADMIN`)

## v22. 라우트 재편 (/ ↔ /topics) 및 메인 피드 교체 (인스타형 피드)

> 변경: 기존 "OfficialTopicList(리스트)" 계획 폐기. 메인 홈(`/`)은 세로 스크롤 풀사이즈 인스타형 피드로 전환. 피드 카드는 신규 `OfficialFeedCard`를 사용하며, `TopicCard`는 `/topics`(커뮤니티)에서 그대로 재사용. 피드 카드 자체에 찬성/반대 버튼을 내장해 카드에서 바로 투표 가능.

- [x] a: `apps/web/app/topics/page.tsx` — 기존 `/?tag=...`로 리다이렉트하던 로직 제거하고, 기존 `apps/web/app/page.tsx`의 커뮤니티 토픽 피드(`CategoryFilter` + `TopicsContent` + `TopicCard` 리스트) 콘텐츠를 그대로 이식. `/topics?tag=...&sort=...` 형태로 searchParams 파싱 유지 (TopicCard 그대로 사용)
- [x] b: `apps/web/app/page.tsx` — 공식 투표 인스타형 피드로 교체. RSC로 `topicDomains.getOfficialPosts()` 호출해 초기 데이터 확보 후 `<OfficialFeedContent initialData={...} />` 렌더. 카테고리 필터는 1차에서 생략(순수 피드 UX)
- [x] c: `apps/web/app/widgets/officialFeedContent.tsx` (신규) — RSC. 초기 1페이지 서버 fetch → `<OfficialFeedList initialData={...} />`에 전달
- [x] d: `apps/web/app/widgets/officialFeedList.tsx` (신규) — `"use client"`, `use-infinite-official-posts.ts` 훅 사용, 세로 스크롤 컨테이너(`flex flex-col gap-0` 혹은 스냅 스크롤). 각 아이템을 `<OfficialFeedCard post={post} myVote={myVote} />`로 렌더. IntersectionObserver 기반 무한스크롤
- [x] e: `apps/web/app/widgets/officialFeedCard.tsx` (신규) — 인스타형 풀사이즈 카드. 구조: 상단 헤더(관리자 뱃지 `공식` + 작성자 닉네임/아바타 + 카테고리 pill), 제목 `text-lg font-bold`, 본문 `text-sm text-foreground/80 line-clamp-3 md:line-clamp-4`, 찬반 분포 바(neutral 제외, agree:disagree 비율만 2색), 찬성/반대 2버튼(내 투표 상태 반영 — 선택 시 `bg-opinion-agree text-white shadow-lg`, 미선택 시 `bg-opinion-agree/15 text-opinion-agree`), footer 메타(`MessageCircle {commentCount}` / `Eye {viewCount}`). 카드 전체를 `Link`로 감싸 상세로 이동(단, 버튼은 `e.preventDefault()+stopPropagation`으로 투표만 수행)
- [x] f: `apps/web/app/widgets/officialFeedCard.tsx` — 투표 연동: `useCreateVote` 훅(또는 공용 vote 뮤테이션) 호출 후 `queryClient.invalidateQueries(queryKeys.topic.officialInfinite)` + 해당 포스트 캐시 업데이트. 비로그인 시 로그인 페이지 리다이렉트
- [x] g: `apps/web/shared/queries/vote.ts` 확인 — 피드 카드용 `useMyVote(postId)` 또는 batch 조회 훅이 있는지 확인, 없으면 postIds 배열로 여러 개 myVote를 한번에 가져오는 훅 추가 검토 (과도하면 개별 훅으로 fallback)
- [x] h: (삭제) 기존 `OfficialTopicsContent` / `OfficialTopicList` / `TopicCard.isOfficial` 배지 분기 계획은 폐기. `TopicCard`에는 변경을 가하지 않음

## v23. BottomTabBar 재편 (홈 버튼 중앙, 커뮤니티 좌측)

- [x] a: `apps/web/shared/components/bottom-tab-bar.tsx` — 좌측 첫 탭을 "커뮤니티"로 변경: `{ label: "커뮤니티", href: "/topics", icon: Users, isActive: (p) => p === "/topics" || p.startsWith("/topics?"), protected: false, isFab: false }` (Home → Users 아이콘으로 변경 import)
- [x] b: `apps/web/shared/components/bottom-tab-bar.tsx` — 중앙 FAB 탭을 "홈"으로 변경: `{ label: "홈", href: "/", icon: Home, isActive: (p) => p === "/", protected: false, isFab: true }`. 기존 글쓰기 FAB 제거
- [x] c: `apps/web/shared/components/bottom-tab-bar.tsx` — FAB 스타일은 유지하되 활성화 시 컬러 차별(선택됨이 자명하므로) 검토. `isActive`일 때 추가 ring/강조 클래스 부여
- [x] d: `apps/web/app/topics/page.tsx` 또는 `apps/web/app/topics/widgets/topicsContent.tsx` — 페이지 내부 우하단 FAB(글쓰기) 버튼 추가: `<Link href="/topics/create">` + `fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary shadow-lg` 스타일. 비로그인 시 로그인 페이지 리다이렉트 처리

## v24. 관리자 전용 공식 투표 작성 페이지

- [x] a: `apps/web/app/admin/posts/create/page.tsx` (신규) — `"use client"`, `useAuth()`로 `user.role !== 'admin'`이면 `/`로 리다이렉트. 내부 UI는 `apps/web/app/topics/widgets/topicCreateForm.tsx` 재사용
- [x] b: `apps/web/app/topics/features/use-create-post.ts` 확장 또는 `apps/web/app/admin/features/use-create-official-post.ts` (신규) — `topicDomains.createOfficialPost` 호출 뮤테이션. 성공 시 `queryClient.invalidateQueries(queryKeys.topic.official)` 후 `/`로 push
- [x] c: `apps/web/app/admin/posts/create/page.tsx` — `topicCreateForm` 재사용 시 submit 핸들러를 공식 작성 훅으로 연결. 일반 작성 훅과 분리되도록 prop 또는 별도 래퍼 컴포넌트 구성
- [x] d: (선택) `apps/web/shared/components/user-menu.tsx` 또는 마이페이지 — `isAdmin`인 경우 "공식 투표 작성" 메뉴 항목 노출해 `/admin/posts/create`로 진입 동선 제공

## v25. NEUTRAL 투표 생성 금지 (백엔드)

> `VoteStatus` enum 자체는 유지 (VoteHistory, 댓글 좌측 컬러바 fallback 등에서 참조). 신규 투표 생성/변경 시에만 NEUTRAL을 차단하고, 기존 DB의 NEUTRAL 데이터와 `Post.neutralCount` 컬럼은 그대로 유지. synchronize 운영이므로 마이그레이션 없음.

- [x] a: `apps/api/src/vote/dto/create-vote.dto.ts` — `@IsEnum(VoteStatus)`를 `@IsIn([VoteStatus.AGREE, VoteStatus.DISAGREE])`로 교체 (import `IsIn` from `class-validator`). 주석으로 "NEUTRAL은 레거시 데이터 전용, 신규 투표 불가" 명시
- [x] b: `apps/api/src/vote/vote.service.ts` — 투표 생성/변경 진입부에서 `if (dto.status === VoteStatus.NEUTRAL) throw new BadRequestException(...)` 재검증 추가. 기존 `previousStatus === NEUTRAL` 감소 로직(84~85행)과 `status === NEUTRAL` 증가 로직(115~116행)은 레거시 데이터를 다른 상태로 변경하는 경우를 대비해 유지 (증가 경로는 dead code지만 보존)
- [x] c: `apps/api/src/post/dto/create-post.dto.ts` — `creatorOpinion` 필드의 `@IsEnum(VoteStatus)`를 `@IsIn([VoteStatus.AGREE, VoteStatus.DISAGREE])`로 교체 (30행 부근)
- [x] d: `apps/api/src/post/post.service.ts` — `creatorOpinion` 수신 시 NEUTRAL이면 거부하는 서비스 레벨 재검증 추가 (DTO 우회 가능성 방어)

## v26. NEUTRAL 투표 UI 제거 (프론트)

> VoteButtons를 3버튼 → 2버튼으로 축소, VoteDistributionBar는 agree:disagree 2색 비율만 표시. 댓글 좌측 컬러바의 neutral fallback(투표 안 한 댓글러 표시)은 유지.

- [x] a: `apps/web/app/topics/[id]/widgets/voteButtons.tsx` — 중립 버튼(`flex-[0.7] ... bg-muted` 블록) 및 관련 handler/라벨 완전 제거. 래퍼 `flex gap-2`에 찬성/반대만 남김. VoteStatus.NEUTRAL import 참조 정리
- [x] b: `apps/web/app/topics/[id]/widgets/voteDistributionBar.tsx` — props에서 `neutralCount` 파라미터는 받되 내부 총합 계산(`total = agree + disagree`)에서 제외. neutral 영역 `<div style={{ width: neutralPercent }}>` 블록 완전 제거. 바는 agree/disagree 2색만 렌더 (agreePercent = agree/(agree+disagree)*100)
- [x] c: `apps/web/app/topics/widgets/topicCard.tsx` — 카드 내부 찬반 분포 바 계산 로직에서 `neutralCount` 제외. agree+disagree 기준 퍼센트 계산으로 변경. 바 자체는 agree/disagree 2색 유지(기존 3색이었다면 neutral 영역 제거)
- [x] d: `apps/web/app/widgets/officialFeedCard.tsx` (v22e에서 신규 작성) — 동일 원칙 적용. 분포 바는 agree/disagree 2색, 버튼도 2개
- [x] e: `apps/web/app/topics/[id]/widgets/` 내 VoteStatus enum 사용처 전반 grep — NEUTRAL 선택 UI(셀렉트, 필터 등) 잔존 여부 확인. 단, `VoteHistoryBadge`/댓글 `stanceColor` fallback은 NEUTRAL 색을 유지(레거시 및 미투표 표시용)
- [x] f: `apps/web/app/my/widgets/voteFilter.tsx` — "중립" 필터 pill 버튼 제거 (전체/찬성/반대 3개로 축소). counts 타입에서 `neutral` 키 제거 또는 무시. 단 `MyVoteCard` 내 상태 배지는 NEUTRAL도 렌더 가능하도록 유지(과거 데이터)
- [x] g: `apps/web/app/my/widgets/myVotesTab.tsx` — counts reduce 로직에서 neutral 집계 제거, 필터 state 타입 `VoteStatus.AGREE | VoteStatus.DISAGREE | 'all'`로 축소

## v27. TOP 댓글 좋아요 isLiked 정확도

> 현재 `findTopByPostId`가 `isLiked: false` 하드코딩 → 새로고침 시 내가 누른 좋아요가 회색으로 돌아옴. 피드는 추가만 가능, 취소 미지원 상태.
> Optional auth 라우트로 변경하고 userId 있으면 CommentLike 일괄 조회로 isLiked를 정확히 채운다. 프론트는 토글 양방향으로 확장.

- [x] a: `apps/api/src/comment/comment.controller.ts` — `OptionalJwtAuthGuard` 신규 추가 후 `@Get('posts/:postId/top')`에 적용. `@CurrentUser()`로 user 추출, 비로그인 호환 유지
- [x] b: `apps/api/src/comment/comment.service.ts::findTopByPostId` — `userId?: string` 추가. userId 있으면 `commentLikeRepository`에서 commentId IN + userId 조건으로 일괄 조회 → Set으로 매핑해 응답의 `isLiked` 채움
- [x] c: `apps/web/app/topics/features/use-top-comment-like.ts` — 토글 양방향 지원. 낙관 업데이트에서 `isLiked` 반전 + `likeCount ± 1` (Math.max로 0 클램프)
- [x] d: `apps/web/app/widgets/officialFeedCard.tsx` — `likedCommentIds` 로컬 set 제거. `c.isLiked` 응답 값 직접 사용. 클릭 시 `mutate({ commentId, postId, isLiked: c.isLiked })`로 토글

## v28. 피드 빈/로딩/에러 상태 디자인

> 빈 댓글, 빈 피드, 무한스크롤 트리거, 에러, 초기 로딩 모두 임시 텍스트 수준. 디자인 톤을 카드와 일관되게 정리.

- [x] a: `apps/web/app/widgets/officialFeedCard.tsx` — TOP 댓글 0건일 때 "첫 댓글을 남겨보세요" placeholder(MessageCircle + muted bg) 노출해 카드 하단 공백 제거
- [x] b: `apps/web/app/widgets/officialFeedList.tsx` — 빈 피드: Inbox 아이콘 + 제목 + 서브 텍스트, admin이면 "공식 투표 작성" CTA
- [x] c: `apps/web/app/widgets/officialFeedList.tsx` — 무한스크롤 트리거를 `<Loader2 animate-spin />`로 교체, 마지막 도달 시 라인 + "모두 불러왔습니다" 미니멀 표기
- [x] d: `apps/web/app/widgets/officialFeedList.tsx` — 에러 상태에 `<AlertCircle />` + 안내 + `refetch()` 버튼
- [x] e: `apps/web/app/widgets/officialFeedSkeleton.tsx` (신규) — `OfficialFeedCardSkeleton` + `OfficialFeedListSkeleton({count})` 두 컴포넌트 export
- [x] f: `app/page.tsx` — Suspense fallback을 `<OfficialFeedListSkeleton count={3} />`로 교체. RSC 초기 fetch 동안 카드 스켈레톤 노출

## v29. 메인 피드 비주얼 언어 정리

> 위계 혼잡: 공식 배지(파란 fill) / 카테고리 pill(중립) / 찬성 버튼(파란 fill)이 모두 파란 계열이라 공식성과 찬성 액션이 시각적으로 충돌. 공식 배지를 다른 색 계열로 분리.

- [x] a: `apps/web/app/widgets/officialFeedCard.tsx` — 공식 배지를 `bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm` + `dark:from-violet-400 dark:to-indigo-400`로 교체. 찬성 버튼(파랑)과 시각 충돌 해소
- [x] b: 카테고리 pill 중립 톤(`bg-muted text-muted-foreground`) 유지 확정. 추가 변경 없음
- [x] c: 텍스트 사이즈 검토 완료. 11(배지/카운트)/12(메타)/13(헤더·댓글닉)/14(본문·댓글본문)/15(투표 버튼)/lg(제목) 6단계가 명확한 위계를 형성하고 있어 추가 통일 불필요로 결정
- [x] d: padding 검토 완료. 헤더 `pt-4 pb-2` → 제목 `pb-3` → 본문(border-top) `pt-3 pb-3` → 하단(border-top) `pt-3 pb-4`는 진입 강조 / 콘텐츠 / 액션 영역의 의도된 차이라 그대로 유지
- [x] e: 그라데이션이 현재 공식 배지 한 곳에서만 사용되어 토큰 추출은 보류 (향후 재사용처 생기면 그때 추출)

## v30. 메인 피드 RSC + Client Island + On-demand Revalidation

> 정적 컨텐츠(제목/본문/카테고리/작성자)는 RSC가 캐시, 모든 카운트(찬반/뷰/댓글)와 인터랙션은 client에서 fresh fetch.
> 시간 기반 ISR 없이 관리자 작성/수정/삭제 시점에만 `revalidateTag('official-feed')`로 즉시 반영.

### 백엔드
- [x] a: `apps/api/src/post/post.controller.ts` — `GET /api/posts/:id/stats` public 라우트 추가
- [x] b: `apps/api/src/post/post.service.ts::getPostStats(postId)` — TypeORM `select`로 5개 컬럼만 조회
- [x] c: `packages/shared-types/src/post.ts` — `PostStatsResponse` 인터페이스 export

### 프론트 데이터 레이어
- [x] d: `apps/web/app/topics/domains/index.ts` — `getPostStats(postId)` 추가
- [x] e: `apps/web/shared/queries/keys.ts` — `post.stats(postId)` 키 추가
- [x] f: `apps/web/shared/queries/post.ts` 신규 + `postQueries.stats` (staleTime 30s) + `shared/queries/index.ts` 배럴 export
- [x] g: `apps/web/app/topics/[id]/features/use-post-vote.ts::onSettled` — `post.stats` invalidate 추가
- [x] h: 좋아요 mutation은 commentCount 변경 없음 — stats invalidate 불필요 확인됨

### 프론트 컴포넌트 분리
- [x] i: `apps/web/app/widgets/officialFeedCard.tsx` → RSC. 헤더/제목/본문/페이드만 렌더
- [x] j: `apps/web/app/widgets/officialFeedCardInteractions.tsx` 신규 (`'use client'`) — 찬반바/버튼/메타/인기 댓글/좋아요. `postQueries.stats`를 initialData로 구독해 카운트 fresh
- [x] k: 외곽 `<Link>`는 RSC 카드에서 처리. 이벤트 차단 wrapper는 island 내부에서 유지
- [x] l: 같은 `OfficialFeedCard`를 RSC 첫 페이지와 client 무한스크롤 페이지에서 공용 (분기 불필요)

### 캐싱 / Revalidation
- [x] m: `getOfficialPosts`에 `next: { tags: ['official-feed'] }` 적용. httpClient가 native fetch라 옵션 그대로 통과
- [x] n: `page.tsx`는 `force-dynamic` 유지(CI 빌드의 prerender 호출 차단). force-dynamic + fetch tag 캐싱은 호환되어 사용자 의도(on-demand 갱신)는 만족
- [x] o: `apps/web/app/api/revalidate/route.ts` 신규 — POST 받아 허용 태그 화이트리스트 검증 후 `revalidateTag(tag, 'max')` (Next.js 16 시그니처)
- [x] p: `useCreateOfficialPost` — 성공 시 React Query 무한쿼리 invalidate + `/api/revalidate` POST + `router.push('/')`

### 검증
- [x] q: `pnpm exec tsc --noEmit` (api/web 양쪽) + `pnpm build` (turbo 전체) 통과. 비로그인 SSR/카드 hydrate/카운트 fresh fetch/관리자 작성 즉시 반영의 dev 환경 직접 동작 확인은 PR 머지 전 사용자 검증 필요
