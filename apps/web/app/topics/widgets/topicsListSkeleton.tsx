/**
 * TopicsContent의 구조와 동일한 카드 목록 스켈레톤.
 * page.tsx의 Suspense fallback으로 사용됩니다.
 */
export function TopicsListSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full divide-y divide-border/50">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="px-4 py-4 space-y-2.5">
          <div className="flex justify-between">
            <div className="h-3 w-10 rounded bg-muted animate-pulse" />
            <div className="h-3 w-14 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
          <div className="flex justify-between">
            <div className="h-3 w-14 rounded bg-muted animate-pulse" />
            <div className="h-3 w-10 rounded bg-muted animate-pulse" />
            <div className="h-3 w-14 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted animate-pulse" />
          <div className="flex gap-3">
            <div className="h-3 w-10 rounded bg-muted animate-pulse" />
            <div className="h-3 w-10 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
