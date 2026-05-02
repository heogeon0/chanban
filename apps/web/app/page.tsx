import { Suspense } from "react";
import { OfficialFeedContent } from "./widgets/officialFeedContent";
import { OfficialFeedListSkeleton } from "./widgets/officialFeedSkeleton";

// 페이지 자체는 force-dynamic — CI 빌드 시 RSC가 백엔드를 prerender 호출하지 않도록 차단.
// 단, RSC 내부 fetch는 next.tags=['official-feed']로 캐싱되어 관리자 mutation 시점에
// revalidateTag로 즉시 무효화된다. 시간 기반 ISR 없이 on-demand 갱신만으로 처리.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={<OfficialFeedListSkeleton count={3} />}>
      <OfficialFeedContent />
    </Suspense>
  );
}
