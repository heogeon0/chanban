export default function TopicDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[840px] mx-auto px-6 py-8">
        {/* 브레드크럼 스켈레톤 */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-8 rounded bg-muted animate-pulse" />
          <div className="h-4 w-2 rounded bg-muted animate-pulse" />
          <div className="h-4 w-12 rounded bg-muted animate-pulse" />
          <div className="h-4 w-2 rounded bg-muted animate-pulse" />
          <div className="h-4 w-10 rounded bg-muted animate-pulse" />
        </div>

        {/* 제목 스켈레톤 */}
        <div className="mb-8 space-y-3">
          <div className="h-9 w-full rounded bg-muted animate-pulse" />
          <div className="h-9 w-3/4 rounded bg-muted animate-pulse" />
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
        </div>

        {/* 본문 스켈레톤 */}
        <div className="mb-12 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-5 rounded bg-muted animate-pulse" style={{ width: `${90 - i * 8}%` }} />
          ))}
        </div>

        {/* 투표 섹션 스켈레톤 */}
        <div className="bg-card border border-border rounded-xl p-6 desktop:p-8 mb-12">
          <div className="h-6 w-24 rounded bg-muted animate-pulse mx-auto mb-8" />
          <div className="flex justify-center gap-4 mb-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 w-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-4 w-full rounded-full bg-muted animate-pulse" />
        </div>

        {/* 댓글 섹션 스켈레톤 */}
        <div className="space-y-6">
          <div className="h-7 w-32 rounded bg-muted animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                  <div className="flex gap-2">
                    <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
