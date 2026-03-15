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
      {/* 인기 토픽 — 배경 분리 */}
      <div className="bg-muted/40 border-b border-border py-8">
        <div className="max-w-6xl mx-auto px-4 desktop:px-8">
          <HotTopicsSection />
        </div>
      </div>

      {/* 로그인 유도 배너 — 비로그인 사용자만 */}
      {!isLoading && !isAuthenticated && (
        <div className="border-b border-border py-8">
          <div className="max-w-6xl mx-auto px-4 desktop:px-8">
            <LoginCtaBanner />
          </div>
        </div>
      )}

      {/* 로그인 피드 섹션 */}
      {!isLoading && isAuthenticated && (
      <div className="max-w-6xl w-full mx-auto px-4 desktop:px-8 py-8 space-y-10 border-b border-border">
        <MyTopicsSection />
        <MyVotesSection />
      </div>
      )}
      {/* 최신 토픽 섹션 */}
      <div className="max-w-6xl w-full mx-auto px-4 desktop:px-8 py-8 space-y-10">
        <LatestTopicsSection />
        <TagTopicsSection />
      </div>
    </>
  );
}
