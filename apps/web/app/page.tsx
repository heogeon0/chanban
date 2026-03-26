"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { HotTopicsSection } from "./feed/widgets/hotTopicsSection";
import { LatestTopicsSection } from "./feed/widgets/latestTopicsSection";
import { LoginCtaBanner } from "./feed/widgets/loginCtaBanner";
import { MyTopicsSection } from "./feed/widgets/myTopicsSection";
import { MyVotesSection } from "./feed/widgets/myVotesSection";
import { TagTopicsSection } from "./feed/widgets/tagTopicsSection";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      {/* 인기 토픽 */}
      <div className="bg-muted/40 border-b border-border">
        <HotTopicsSection />
      </div>

      {/* 로그인 유도 배너 — 비로그인 사용자만 */}
      {!isLoading && !isAuthenticated && (
        <div className="border-b border-border px-4 py-6">
          <LoginCtaBanner />
        </div>
      )}

      {/* 로그인 피드 섹션 */}
      {!isLoading && isAuthenticated && (
        <div className="border-b border-border divide-y divide-border/50">
          <MyTopicsSection />
          <MyVotesSection />
        </div>
      )}

      {/* 최신 토픽 섹션 */}
      <div className="divide-y divide-border/50">
        <LatestTopicsSection />
        <TagTopicsSection />
      </div>
    </>
  );
}
