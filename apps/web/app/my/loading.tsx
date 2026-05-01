export default function MyPageLoading() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* 프로필 스켈레톤 */}
      <div className="px-5 pt-6 pb-5 border-b border-border">
        <div className="flex items-center gap-6">
          <div className="size-[72px] rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex flex-1 items-center justify-around">
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-7 w-8 rounded bg-muted animate-pulse" />
              <div className="h-3 w-10 rounded bg-muted/60 animate-pulse" />
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-7 w-8 rounded bg-muted animate-pulse" />
              <div className="h-3 w-10 rounded bg-muted/60 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="h-5 w-24 rounded bg-muted animate-pulse mt-3.5" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-16 rounded-full bg-muted/70 animate-pulse" />
          <div className="h-6 w-16 rounded-full bg-muted/70 animate-pulse" />
        </div>
      </div>

      {/* 탭 스켈레톤 */}
      <div className="flex border-b border-border">
        <div className="flex-1 h-12 bg-muted/30 animate-pulse" />
        <div className="flex-1 h-12 bg-muted/30 animate-pulse" />
      </div>

      {/* 리스트 스켈레톤 */}
      <div className="divide-y divide-border/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-4 space-y-2.5">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-1.5 w-full bg-muted rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
