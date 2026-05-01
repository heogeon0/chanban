import { Suspense } from "react";
import { OfficialFeedContent } from "./widgets/officialFeedContent";
import { OfficialFeedListSkeleton } from "./widgets/officialFeedSkeleton";

// 공식 피드는 항상 최신을 보여줘야 하고, RSC가 빌드 시점에 백엔드 API를
// 호출하려다 CI 환경에서 ECONNREFUSED로 실패하는 문제가 있어 SSG를 차단.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={<OfficialFeedListSkeleton count={3} />}>
      <OfficialFeedContent />
    </Suspense>
  );
}
