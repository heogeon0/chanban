import { Suspense } from "react";
import { OfficialFeedContent } from "./widgets/officialFeedContent";
import { OfficialFeedListSkeleton } from "./widgets/officialFeedSkeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<OfficialFeedListSkeleton count={3} />}>
      <OfficialFeedContent />
    </Suspense>
  );
}
