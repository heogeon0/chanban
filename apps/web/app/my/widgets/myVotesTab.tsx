'use client';

import { TopicCard } from '@/app/topics/widgets/topicCard';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useEffect, useRef } from 'react';
import { useInfiniteMyVotes } from '../features/use-infinite-my-votes';

/**
 * 내 투표 내역 탭 — 무한스크롤
 */
export function MyVotesTab() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMyVotes();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { entries } = useIntersectionObserver(loadMoreRef, { threshold: 0.5 });

  useEffect(() => {
    if (entries.length > 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entries, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="divide-y divide-border/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-4 py-4 space-y-2.5">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-1.5 w-full bg-muted rounded-full animate-pulse" />
            <div className="flex gap-3">
              <div className="h-3 w-10 bg-muted rounded animate-pulse" />
              <div className="h-3 w-10 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const allVotes = data?.pages.flatMap((page) => page.data) ?? [];

  if (!allVotes.length) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        투표한 내역이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-border/50">
        {allVotes.map((vote) => {
          if (!vote.post) return null;
          return (
            <TopicCard key={vote.id} post={vote.post} myVote={vote.currentStatus} />
          );
        })}
      </div>
      <div ref={loadMoreRef} className="flex items-center justify-center py-8">
        {isFetchingNextPage ? (
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        ) : !hasNextPage ? (
          <p className="text-sm text-muted-foreground">모든 항목을 불러왔습니다</p>
        ) : null}
      </div>
    </>
  );
}
