/**
 * 공식 피드 카드 스켈레톤.
 * RSC 초기 fetch 또는 무한쿼리 첫 진입 시 노출되어 카드 레이아웃 점프를 줄인다.
 */
export function OfficialFeedCardSkeleton() {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-pulse">
      <header className="flex items-center gap-2 px-4 pt-4 pb-2">
        <div className="h-5 w-12 rounded-full bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="ml-auto h-5 w-12 rounded-full bg-muted" />
      </header>

      <div className="px-4 pb-3 flex flex-col gap-2">
        <div className="h-5 w-4/5 rounded bg-muted" />
        <div className="h-5 w-3/5 rounded bg-muted" />
      </div>

      <div className="px-4 pt-3 pb-3 border-t border-border/60 flex flex-col gap-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-11/12 rounded bg-muted" />
        <div className="h-4 w-9/12 rounded bg-muted" />
      </div>

      <div className="shrink-0 px-4 pt-3 pb-4 flex flex-col gap-3 border-t border-border">
        <div className="h-8 w-full rounded-lg bg-muted" />
        <div className="flex gap-2.5">
          <div className="flex-1 h-16 rounded-xl bg-muted" />
          <div className="flex-1 h-16 rounded-xl bg-muted" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 w-10 rounded bg-muted" />
          <div className="h-3 w-12 rounded bg-muted" />
        </div>
      </div>
    </article>
  );
}

interface OfficialFeedListSkeletonProps {
  count?: number;
}

export function OfficialFeedListSkeleton({ count = 3 }: OfficialFeedListSkeletonProps) {
  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      {Array.from({ length: count }).map((_, i) => (
        <OfficialFeedCardSkeleton key={i} />
      ))}
    </div>
  );
}
