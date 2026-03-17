"use client";

import { useState } from "react";
import { UserCommentsTab } from "./user-comments-tab";
import { UserTopicsTab } from "./user-topics-tab";

type TabType = "topics" | "comments";

interface UserProfileTabsProps {
  userId: string;
}

/**
 * 프로필 페이지 탭 (토픽 | 의견)
 */
export function UserProfileTabs({ userId }: UserProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("topics");

  return (
    <div className="w-full">
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("topics")}
          className={`flex flex-1 items-center justify-center py-3.5 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "topics"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          토픽
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex flex-1 items-center justify-center py-3.5 text-sm font-bold transition-colors border-b-2 ${
            activeTab === "comments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          의견
        </button>
      </div>

      {activeTab === "topics" ? (
        <UserTopicsTab userId={userId} />
      ) : (
        <UserCommentsTab userId={userId} />
      )}
    </div>
  );
}
