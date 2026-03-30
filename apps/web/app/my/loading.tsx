export default function MyPageLoading() {
  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* 프로필 스켈레톤 */}
      <div className="px-4 py-8 border-b border-border flex flex-col items-center gap-3">
        <div className="size-20 rounded-full bg-muted animate-pulse" />
        <div className="h-6 w-32 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-2 gap-3 w-full mt-3">
          <div className="h-20 rounded-xl bg-muted animate-pulse" />
          <div className="h-20 rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="h-5 w-16 rounded bg-muted/50 animate-pulse mt-2" />
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
