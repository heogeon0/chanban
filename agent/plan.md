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

## v18. Supabase 프로젝트 셋업 & 환경변수

> 이미지 업로드 기능 전반의 인프라 준비 단계. 사용자가 Supabase 대시보드에서 수동으로 버킷을 만들고 키를 확보한 뒤, 코드 레벨에선 env 변수 스키마와 문서를 정리한다.

- [x] a: (수동 작업 — README에 명시) Supabase 프로젝트 생성 후 `post-images`, `comment-images` 두 개의 public 버킷을 대시보드에서 생성. 각 버킷 File size limit = 2MB, Allowed MIME types = `image/jpeg,image/png,image/webp,image/gif`로 설정
- [x] b: (수동 작업 — README에 명시) Supabase Storage의 RLS 정책으로 `auth.uid()::text = (storage.foldername(name))[1]` 조건의 INSERT 정책 추가 (프론트가 anon key로 직접 업로드할 경우 대비). 현재는 서버에서 signed URL을 발급하므로 선택적이지만 이중 방어 차원 — 자체 JWT 환경이라 스킵
- [x] c: `apps/api/.env.example` 신규 생성 또는 기존 파일에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_POST_BUCKET=post-images`, `SUPABASE_COMMENT_BUCKET=comment-images` 추가. 주석으로 "Service Role Key는 절대 프론트에 노출 금지" 명시
- [x] d: `apps/web/.env.example` 신규 생성 또는 기존 파일에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가 (프론트는 anon key만 사용 — signed URL 업로드 시 필요)
- [x] e: `apps/api/src/config/` 하위에 `supabase.config.ts` 신규 생성 — `registerAs('supabase', () => ({ url, serviceRoleKey, postBucket, commentBucket }))` 패턴으로 `ConfigModule.forRoot` 에 등록. `apps/api/src/app.module.ts`의 `ConfigModule.forRoot({ load: [...] })`에 추가
- [x] f: README 또는 `docs/` 하위에 `supabase-setup.md` 신규 — 버킷 생성 방법, 키 획득 절차, 로컬 .env 세팅 순서, 프로덕션 env 주입(Railway 환경변수) 기록 (주석으로 `ALTER TABLE posts ADD COLUMN images text[] DEFAULT '{}' NOT NULL;` / `ALTER TABLE comments ADD COLUMN images text[] DEFAULT '{}' NOT NULL;` SQL도 포함)

## v19. 백엔드 엔티티 & DTO 확장

> Post / Comment 엔티티에 `images text[]` 컬럼 추가, Create DTO 및 Response 매핑도 함께 확장. `synchronize: true`라 부팅 시 자동 반영되지만 `ValidationPipe { forbidNonWhitelisted: true }` 때문에 DTO에 반드시 선언해야 한다.

- [x] a: `apps/api/src/entities/post.entity.ts` — `@Column('text', { array: true, default: () => "'{}'" }) images: string[];` 필드 추가 (content 필드 다음 적절한 위치)
- [x] b: `apps/api/src/entities/comment.entity.ts` — 동일하게 `@Column('text', { array: true, default: () => "'{}'" }) images: string[];` 필드 추가
- [x] c: `apps/api/src/post/dto/create-post.dto.ts` — `@IsOptional() @IsArray() @ArrayMaxSize(5) @IsString({ each: true }) images?: string[];` 추가. `class-validator`에서 `ArrayMaxSize`, `IsArray`, `IsString` import
- [x] d: `apps/api/src/comment/dto/create-comment.dto.ts` — 동일 패턴으로 `@IsOptional() @IsArray() @ArrayMaxSize(2) @IsString({ each: true }) images?: string[];` 추가
- [x] e: `apps/api/src/post/dto/post-response.dto.ts` (또는 매핑 지점) — `images: string[]` 필드 노출 확인. 엔티티 그대로 반환하는 경로면 무변경, 별도 매퍼 있으면 명시 추가
- [x] f: `apps/api/src/comment/comment.service.ts` 줄 107~118 — `findByPostId`의 `.select([...])` 배열에 `'reply.images'` 추가 (누락 시 답글 이미지 필드가 API 응답에서 빠짐). 같은 메서드에서 원 댓글 select 항목에도 `'comment.images'` 추가
- [x] g: `apps/api/src/post/post.service.ts` — `create(dto, user)` 메서드에서 `images: dto.images ?? []`를 엔티티 생성 시 포함. AI 요약 등 기존 로직엔 영향 없음 확인

## v20. 소유권 검증 유틸 & Signed Upload URL 엔드포인트

> 프론트 직접 업로드(A안)를 안전하게 쓰기 위한 서버측 발급/검증 로직. path prefix = userId를 강제해 소유권을 보장한다.

- [x] a: `apps/api/package.json` — `@supabase/supabase-js` 의존성 추가 (pnpm workspace 루트에서 `pnpm add @supabase/supabase-js --filter api`)
- [x] b: `apps/api/src/upload/upload.module.ts` 신규 — `UploadController` + `UploadService` 등록, `ConfigModule` import
- [x] c: `apps/api/src/upload/upload.service.ts` 신규 — `createSupabaseClient()` (service role key 사용), `createSignedUploadUrl(scope, userId, filename, mimeType)` 메서드. 로직: MIME 화이트리스트 검증(`image/jpeg|png|webp|gif`), 확장자 추출, `key = \`${userId}/${yyyy}/${mm}/${uuid}.${ext}\``, `supabase.storage.from(bucket).createSignedUploadUrl(key)` 호출 후 `{ uploadUrl, token, publicUrl, key }` 반환. bucket은 scope별로 `post-images` / `comment-images` 선택
- [x] d: `apps/api/src/upload/dto/sign-upload.dto.ts` 신규 — `@IsIn(['post', 'comment']) scope`, `@IsString() @MaxLength(200) filename`, `@IsIn(['image/jpeg','image/png','image/webp','image/gif']) mimeType`, `@IsInt() @Max(2 * 1024 * 1024) size` 필드
- [x] e: `apps/api/src/upload/upload.controller.ts` 신규 — `@Controller('uploads')` + `@UseGuards(JwtAuthGuard)` + `@Post('sign')` 엔드포인트. `@CurrentUser() user` 받아서 `uploadService.createSignedUploadUrl(...)` 호출. 응답 `{ uploadUrl, token, key, publicUrl }`
- [x] f: `apps/api/src/app.module.ts` — `UploadModule` import 추가
- [x] g: `apps/api/src/common/utils/image-key.util.ts` 신규 — `validateImageKeyOwnership(key: string, userId: string): boolean` 함수. key의 첫 세그먼트가 userId와 일치하는지 체크. `apps/api/src/post/post.service.ts#create` 및 `comment.service.ts#create` 트랜잭션 안에서 각 `dto.images`를 순회하며 검증, 불일치 시 `BadRequestException` throw

## v21. shared-types 타입 확장

> 백엔드 DTO 변경과 맞물려 프론트에서 바로 타입 참조할 수 있도록 shared-types에 `images` 필드 반영.

- [x] a: `packages/shared-types/src/post.ts` — `PostResponse` 인터페이스에 `images: string[]` 필드 추가 (content 다음)
- [x] b: `packages/shared-types/src/comment.ts` — `CommentResponse` 및 `CommentReplyResponse` 인터페이스 각각에 `images: string[]` 필드 추가
- [x] c: `packages/shared-types/src/index.ts` — barrel export 변경 불필요 확인 (기존 `export *`면 자동 반영)
- [x] d: 필요 시 `packages/shared-types`에 `UploadSignRequest`, `UploadSignResponse` 타입 신규 추가 (프론트/백 공용): `{ scope: 'post' | 'comment', filename, mimeType, size }` / `{ uploadUrl, token, key, publicUrl }`

## v22. 프론트 Supabase 클라이언트 & 업로드 훅

> 프론트에서 signed URL을 받아 Supabase Storage에 PUT하는 로직을 재사용 가능한 훅으로 추출.

- [x] a: `apps/web/package.json` — `@supabase/supabase-js` 의존성 추가 (`pnpm add @supabase/supabase-js --filter web`)
- [x] b: `apps/web/lib/supabase.ts` 신규 — `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)` 싱글턴 export. `auth: { persistSession: false }` (이 프로젝트는 자체 JWT라 Supabase auth 비활성)
- [x] c: `apps/web/shared/queries/upload.ts` 신규 — `uploadDomains.signUpload({ scope, filename, mimeType, size })` 함수: `httpClient.post('/api/uploads/sign', body)` 호출해 `{ uploadUrl, token, key, publicUrl }` 반환
- [x] d: `apps/web/shared/hooks/useImageUpload.ts` 신규 — `useImageUpload(scope: 'post' | 'comment')` 훅. 내부 상태: `{ uploading: boolean, progress: number, error: string | null }`. `upload(file: File): Promise<{ key, publicUrl }>` 메서드 노출. 흐름: ① 클라이언트 검증(MIME 화이트리스트, 2MB 이하) ② `uploadDomains.signUpload(...)` 호출 ③ `supabase.storage.from(bucket).uploadToSignedUrl(key, token, file)` ④ publicUrl 반환. 에러 메시지는 사용자 친화적으로
- [x] e: `apps/web/shared/hooks/useImageUpload.ts` — 개수/크기 상수를 `shared/constants/image.ts`로 분리: `MAX_POST_IMAGES=5`, `MAX_COMMENT_IMAGES=2`, `MAX_IMAGE_SIZE=2*1024*1024`, `ALLOWED_IMAGE_MIME_TYPES=['image/jpeg','image/png','image/webp','image/gif']`

## v23. 공통 ImageUploader UI 컴포넌트

> 게시글/댓글 양쪽에서 재사용할 순수 UI 업로더. 드래그&드롭 + 클릭 선택 + 프리뷰 + 삭제 + 개수/크기 검증. widgets 레이어가 아닌 shared/components (공용)로 둔다.

- [x] a: `apps/web/shared/components/imageUploader/imageUploader.tsx` 신규 — Props: `{ value: string[], onChange: (urls: string[]) => void, maxCount: number, scope: 'post' | 'comment' }`. 내부에서 `useImageUpload(scope)` 사용. 업로드 완료된 publicUrl을 `onChange`로 부모에 전달
- [x] b: `apps/web/shared/components/imageUploader/imageUploader.tsx` — UI 구조: 상단 `<div>` 프리뷰 그리드 (업로드 완료 이미지 썸네일 + X 삭제 버튼, 업로드 중 이미지는 스피너 오버레이), 하단 `<button>` "+ 이미지 추가" (나머지 슬롯 수 표시 `2/5`). `<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden>` 내장
- [x] c: `apps/web/shared/components/imageUploader/imageUploader.tsx` — 드래그&드롭 지원: `onDragOver`, `onDrop` 핸들러. 드래그 시 `border-dashed border-primary` 시각적 피드백
- [x] d: `apps/web/shared/components/imageUploader/imagePreview.tsx` 신규 — 프리뷰 카드 컴포넌트 분리 (썸네일 + 삭제 버튼 + 업로드 중 스피너)
- [x] e: `apps/web/shared/components/imageUploader/imageUploader.tsx` — 검증 실패(MIME/size/개수) 시 toast 또는 인라인 에러 문구 표시. 기존 toast 유틸 재사용
- [x] f: `apps/web/shared/components/imageUploader/index.ts` 신규 — barrel export

## v24. 게시글 작성 폼 이미지 업로더 통합

> `topicCreateForm.tsx`에 ImageUploader를 삽입하고, `useCreatePost` 훅 경로에서 `images`를 DTO로 함께 전송한다. Lexical PlainText는 건드리지 않는다.

- [x] a: `apps/web/shared/queries/topic.ts` — `CreatePostDto` 인터페이스 (줄 106~112)에 `images?: string[]` 추가
- [x] b: `apps/web/app/topics/features/use-create-post.ts` — mutation fn의 payload 빌드 시 `images`를 받아 전달하도록 시그니처 확장 (`{ title, content, tag, images?, ... }`)
- [x] c: `apps/web/app/topics/widgets/topicCreateForm.tsx` — `const [images, setImages] = useState<string[]>([])` 상태 추가. 에디터(Lexical) 블록 아래에 `<ImageUploader value={images} onChange={setImages} maxCount={5} scope="post" />` 삽입
- [x] d: `apps/web/app/topics/widgets/topicCreateForm.tsx` — submit 핸들러에서 `createPost({ ..., images })` 형태로 전달
- [x] e: `apps/web/app/topics/widgets/topicCreateForm.tsx` — 업로드 진행 중(최소 하나라도 uploading 상태)이면 제출 버튼 `disabled` 처리. `useImageUpload`의 전역 uploading 여부를 ImageUploader가 `onUploadingChange?` 콜백으로 노출해 부모가 감지

## v25. 댓글 작성 폼 이미지 업로더 통합

> `commentForm.tsx`에 동일 패턴으로 ImageUploader 추가. 최대 2장. 답글 작성에도 동일 폼을 사용 중이면 자동 반영됨.

- [x] a: `apps/web/shared/queries/comment.ts` — `CreateCommentDto` 인터페이스 (줄 85~89)에 `images?: string[]` 추가
- [x] b: `apps/web/app/topics/[id]/features/use-post-comment.ts` — mutation payload에 `images` 포함
- [x] c: `apps/web/app/topics/[id]/widgets/commentForm.tsx` — `const [images, setImages] = useState<string[]>([])` 상태 추가. 에디터 아래에 `<ImageUploader value={images} onChange={setImages} maxCount={2} scope="comment" />` 삽입 (컴팩트 variant 필요 시 Props 확장)
- [x] d: `apps/web/app/topics/[id]/widgets/commentForm.tsx` — submit 시 `postComment({ ..., images })`, 성공 후 `setImages([])` 초기화
- [x] e: `apps/web/app/topics/[id]/widgets/commentForm.tsx` — 업로드 진행 중이면 제출 버튼 disabled (v24e와 동일 패턴)

## v26. 본문/댓글 이미지 렌더링

> 저장된 `images: string[]`을 각 화면에서 본문 아래 그리드/썸네일로 렌더. 클릭 시 라이트박스는 v27에서 별도 처리.

- [x] a: `apps/web/app/topics/[id]/widgets/imageGallery.tsx` 신규 — Props: `{ images: string[], onImageClick?: (index: number) => void }`. 1장: 전체폭 (`rounded-xl aspect-video object-cover`), 2장: 1:1 그리드, 3~5장: 첫 장 크게 + 나머지 썸네일. `next/image` 사용 (권장) 또는 `<img>`
- [x] b: `apps/web/app/topics/[id]/page.tsx` — 본문 `<p>{topic.content}</p>` (줄 141 근처) 블록 바로 아래에 `{topic.images?.length > 0 && <ImageGallery images={topic.images} />}` 삽입
- [x] c: `apps/web/app/topics/[id]/widgets/comment.tsx` — 본문 `<p>{comment.content}</p>` (줄 170~172 근처) 아래에 `{comment.images?.length > 0 && <ImageGallery images={comment.images} compact />}` 삽입 (compact variant = 고정 높이 100px, 썸네일 row)
- [x] d: `apps/web/app/topics/[id]/widgets/replyComment.tsx` — 본문 (줄 77~79 근처) 아래에 동일하게 `ImageGallery compact` 추가
- [x] e: `apps/web/app/topics/[id]/widgets/imageGallery.tsx` — `compact` variant props 추가: true면 `h-20 rounded-lg object-cover` 고정 썸네일 row로 렌더

## v27. 이미지 라이트박스 (클릭 확대)

> 이미지 클릭 시 전체 화면 모달로 확대 보기. 좌우 키/버튼으로 네비게이션. shared 컴포넌트로 분리해 게시글/댓글 공용.

- [x] a: `apps/web/shared/components/imageLightbox/imageLightbox.tsx` 신규 — Props: `{ images: string[], initialIndex: number, isOpen: boolean, onClose: () => void }`. 구조: `fixed inset-0 z-50 bg-black/90 flex items-center justify-center`, 중앙 이미지 + 좌우 `<ChevronLeft/ChevronRight>` 버튼 + 우상단 `<X>` 닫기
- [x] b: `apps/web/shared/components/imageLightbox/imageLightbox.tsx` — 키보드: Escape = close, ArrowLeft/Right = prev/next. 터치 스와이프는 MVP 범위 밖 (후속 개선)
- [x] c: `apps/web/app/topics/[id]/widgets/imageGallery.tsx` — 내부에서 `const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)` 상태 관리, 이미지 클릭 시 `setLightboxIndex(i)`, `<ImageLightbox images={images} initialIndex={lightboxIndex ?? 0} isOpen={lightboxIndex !== null} onClose={() => setLightboxIndex(null)} />` 렌더
- [x] d: `apps/web/shared/components/imageLightbox/index.ts` 신규 — barrel export

## v28. Next.js 이미지 최적화 설정

> `next/image`로 Supabase Storage 이미지를 렌더하려면 `remotePatterns` 설정 필수.

- [x] a: `apps/web/next.config.mjs` — 현재 빈 객체 `nextConfig = {}` 를 `nextConfig = { images: { remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }] } }` 로 확장. 환경별 도메인은 env에서 읽는 방식으로 추후 개선 가능
- [x] b: `apps/web/next.config.mjs` — 이미지 기본 포맷에 `formats: ['image/webp']` 추가 (최적화)
- [x] c: (확인 작업) `next/image` 사용 여부 재확인 — v26a에서 `next/image` 채택 시 이 v28이 필수, `<img>` 태그면 선택. 팀 컨벤션에 맞춰 통일

## v29. 고아 파일 정리 & 운영 메모 (MVP 범위 외 기록)

> MVP에선 orphan 허용, 추후 cron/hard-delete 시점에 정리. 여기선 운영 참고사항을 기록만 하고 실제 cron 구현은 별도 이슈로 분리.

- [x] a: `docs/supabase-setup.md` (v18f에서 생성) 하단에 "고아 파일 정리 전략" 섹션 추가 — 1) 업로드 후 10분 내 DB 연결 안 된 key 삭제하는 Supabase Edge Function 예제, 2) 게시글/댓글 hard delete 시점에 `storage.remove([keys])` 호출하는 훅 지점(서비스 레이어 어디에 추가할지) 명시
- [x] b: `apps/api/src/post/post.service.ts` — `remove(id)` (soft delete) 메서드 주석으로 "TODO: hard delete 시점에 supabase storage에서 images 배열 삭제" 표기
- [x] c: `apps/api/src/comment/comment.service.ts` — `remove(id)` 메서드 동일 주석 추가
- [x] d: (선택) `apps/api/src/upload/upload.service.ts` — `deleteImages(scope, keys: string[])` 메서드 스텁 추가 (구현은 추후). 호출부는 비워두되 시그니처만 준비
