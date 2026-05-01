export default function CreateTopicLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* 카테고리 */}
        <div className="space-y-2">
          <div className="h-5 w-16 rounded bg-muted animate-pulse" />
          <div className="flex gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-7 w-14 rounded-full bg-muted animate-pulse" />
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className="space-y-2">
          <div className="h-5 w-10 rounded bg-muted animate-pulse" />
          <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
        </div>

        {/* 내용 */}
        <div className="space-y-2">
          <div className="h-5 w-10 rounded bg-muted animate-pulse" />
          <div className="h-[300px] w-full rounded-md bg-muted animate-pulse" />
        </div>

        {/* 제출 버튼 */}
        <div className="h-11 w-full rounded-md bg-muted animate-pulse" />
      </div>
    </div>
  );
}
