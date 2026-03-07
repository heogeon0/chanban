/**
 * TopicsContent의 구조와 동일한 카드 목록 스켈레톤.
 * page.tsx의 Suspense fallback으로 사용됩니다.
 */
export function TopicsListSkeleton() {
  return (
    <div className="max-w-4xl mx-auto w-full px-0 desktop:px-8 desktop:py-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="p-4 desktop:p-5 border-t desktop:border desktop:border-border desktop:mb-3 space-y-2"
        >
          <div className="flex justify-between">
            <div className="h-3 w-10 rounded bg-muted animate-pulse" />
            <div className="h-3 w-14 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
          <div className="hidden desktop:block h-4 w-full rounded bg-muted animate-pulse" />
          <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
          <div className="flex gap-3">
            <div className="h-3 w-10 rounded bg-muted animate-pulse" />
            <div className="h-3 w-10 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
