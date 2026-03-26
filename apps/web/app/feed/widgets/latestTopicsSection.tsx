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
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-4 space-y-2.5">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-1.5 w-full bg-muted rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (topics.length === 0) return null;

  return (
    <section>
      <div className="px-4 pt-5 pb-3">
        <FeedSectionHeader
          title="🆕 최신 토픽"
          moreHref="/topics?sort=latest"
          moreLabel="더보기"
        />
      </div>
      <div className="divide-y divide-border/50">
        {topics.map((topic) => (
          <TopicCard key={topic.id} post={topic} />
        ))}
      </div>
    </section>
  );
}
