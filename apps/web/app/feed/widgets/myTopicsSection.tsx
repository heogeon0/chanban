"use client";

import { TopicCard } from "@/app/topics/widgets/topicCard";
import { userQueries } from "@/shared/queries/user";
import { useQuery } from "@tanstack/react-query";
import { FeedSectionHeader } from "./feedSectionHeader";

/**
 * 내가 쓴 토론 섹션 컴포넌트
 * 로그인 사용자에게만 노출됩니다.
 */
export function MyTopicsSection() {
  const { data, isLoading } = useQuery(userQueries.myPosts(1));
  const topics = data?.data.slice(0, 3) ?? [];

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-36 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid desktop:grid-cols-2 gap-3 desktop:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full h-40 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (topics.length === 0) return null;

  return (
    <section>
      <FeedSectionHeader
        title="📝 내가 쓴 토론"
        moreHref="/my"
        moreLabel="더보기"
      />
      <div className="grid desktop:grid-cols-2 gap-3 desktop:gap-4">
        {topics.map((topic) => (
          <TopicCard key={topic.id} post={topic} />
        ))}
      </div>
    </section>
  );
}
