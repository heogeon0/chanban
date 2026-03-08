export default function MyPageLoading() {
  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* 프로필 스켈레톤 */}
      <div className="px-4 py-8 desktop:px-8 desktop:py-10 border-b border-border">
        {/* 모바일: 중앙 정렬 / 데스크탑: 수평 */}
        <div className="flex flex-col items-center gap-4 desktop:flex-row desktop:justify-between">
          <div className="flex flex-col items-center gap-3 desktop:flex-row desktop:gap-6">
            <div className="size-24 desktop:size-28 rounded-2xl desktop:rounded-3xl bg-muted animate-pulse" />
            <div className="flex flex-col items-center gap-2 desktop:items-start">
              <div className="h-7 w-36 rounded bg-muted animate-pulse" />
              <div className="h-4 w-48 rounded bg-muted animate-pulse hidden desktop:block" />
            </div>
          </div>
          <div className="w-full desktop:w-32 h-9 rounded-full bg-muted animate-pulse" />
        </div>

        {/* 통계 그리드 - 모바일 전용 */}
        <div className="grid grid-cols-2 gap-3 mt-6 desktop:hidden">
          <div className="h-20 rounded-xl bg-muted animate-pulse" />
          <div className="h-20 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex border-b border-border">
        <div className="flex-1 h-12 bg-muted/30 animate-pulse" />
        <div className="flex-1 h-12 bg-muted/30 animate-pulse" />
      </div>

      {/* 카드 목록 스켈레톤 */}
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4 p-4 desktop:p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
