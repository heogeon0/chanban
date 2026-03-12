"use client";

import { TopicCard } from "@/app/topics/widgets/topicCard";
import { topicQueries } from "@/shared/queries/topic";
import { useQuery } from "@tanstack/react-query";
import { FeedSectionHeader } from "./feedSectionHeader";

/**
 * 최신 토픽 섹션 컴포넌트
 * 모든 사용자에게 노출됩니다.
 */
export function LatestTopicsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["feed", "latest"],
    queryFn: () => topicQueries.list("recent", 1).queryFn(),
  });

  const topics = data?.data.slice(0, 4) ?? [];

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid desktop:grid-cols-2 gap-3 desktop:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
        title="🆕 최신 토픽"
        moreHref="/topics?sort=latest"
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
