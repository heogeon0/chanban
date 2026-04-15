import { Suspense } from "react";
import { OfficialFeedContent } from "./widgets/officialFeedContent";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-muted-foreground">
          공식 투표를 불러오는 중...
        </div>
      }
    >
      <OfficialFeedContent />
    </Suspense>
  );
}
