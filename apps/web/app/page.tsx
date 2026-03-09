"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { HotTopicsSection } from "./feed/widgets/hotTopicsSection";
import { MyTopicsSection } from "./feed/widgets/myTopicsSection";
import { MyVotesSection } from "./feed/widgets/myVotesSection";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      {/* 인기 토픽 — 배경 분리 */}
      <div className="bg-muted/40 border-b border-border py-8">
        <div className="max-w-6xl mx-auto px-4 desktop:px-8">
          <HotTopicsSection />
        </div>
      </div>

      {/* 개인화 섹션 */}
      <div className="max-w-6xl mx-auto px-4 desktop:px-8 py-8 space-y-10">
        {!isLoading && isAuthenticated && <MyTopicsSection />}
        {!isLoading && isAuthenticated && <MyVotesSection />}
      </div>
    </>
  );
}
