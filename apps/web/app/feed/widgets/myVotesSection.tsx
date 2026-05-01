"use client";

import { useQuery } from "@tanstack/react-query";
import { userQueries } from "@/shared/queries/user";
import { TopicCard } from "@/app/topics/widgets/topicCard";
import { FeedSectionHeader } from "./feedSectionHeader";

/**
 * 내가 참여한 의견 섹션 컴포넌트
 * 로그인 사용자에게만 노출됩니다.
 */
export function MyVotesSection() {
  const { data, isLoading } = useQuery(userQueries.myVotes(1));
  const votes = data?.data.slice(0, 3) ?? [];

  if (isLoading) {
    return (
      <section>
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <div className="h-6 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 3 }).map((_, i) => (
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

  if (votes.length === 0) return null;

  return (
    <section>
      <div className="px-4 pt-5 pb-3">
        <FeedSectionHeader
          title="🗳 내가 참여한 의견"
          moreHref="/my?tab=votes"
          moreLabel="더보기"
        />
      </div>
      <div className="divide-y divide-border/50">
        {votes.map((vote) => (
          <TopicCard key={vote.id} post={vote.post} myVote={vote.currentStatus} />
        ))}
      </div>
    </section>
  );
}
