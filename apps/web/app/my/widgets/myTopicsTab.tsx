'use client';

import { TopicCard } from '@/app/topics/widgets/topicCard';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useEffect, useRef } from 'react';
import { useInfiniteMyTopics } from '../features/use-infinite-my-topics';

/**
 * 내가 작성한 토픽 목록 탭 — 무한스크롤
 */
export function MyTopicsTab() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMyTopics();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { entries } = useIntersectionObserver(loadMoreRef, { threshold: 0.5 });

  useEffect(() => {
    if (entries.length > 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entries, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-3 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
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

  const allTopics = data?.pages.flatMap((page) => page.data) ?? [];

  if (!allTopics.length) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        작성한 토픽이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 px-3 pb-3">
        {allTopics.map((post) => (
          <TopicCard key={post.id} post={post} />
        ))}
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
