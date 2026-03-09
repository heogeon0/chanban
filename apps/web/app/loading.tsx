export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 desktop:px-8 py-6 space-y-10">
      {/* 인기 토픽 섹션 스켈레톤 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex desktop:grid desktop:grid-cols-2 gap-3 desktop:gap-4 overflow-x-auto pb-2 desktop:overflow-x-visible desktop:pb-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[280px] desktop:min-w-0 h-40 bg-muted rounded animate-pulse shrink-0"
            />
          ))}
        </div>
      </section>

      {/* 내가 쓴 토론 섹션 스켈레톤 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-36 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid desktop:grid-cols-2 gap-3 desktop:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </section>

      {/* 내가 참여한 의견 섹션 스켈레톤 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid desktop:grid-cols-2 gap-3 desktop:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}
