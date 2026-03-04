export default function TopicsLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 스켈레톤 */}
      <div className="p-4 desktop:px-8 desktop:py-6 space-y-4 border-b border-border">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <div className="h-7 w-16 rounded bg-muted animate-pulse" />
            <div className="h-8 w-32 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-16 rounded-full bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 카드 스켈레톤 */}
      <div className="flex-1 overflow-y-auto">
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
      </div>
    </div>
  );
}
