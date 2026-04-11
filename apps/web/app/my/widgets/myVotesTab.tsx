'use client';

import { VoteStatus } from '@chanban/shared-types';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteMyVotes } from '../features/use-infinite-my-votes';
import { MyVoteCard } from './myVoteCard';
import { VoteFilter } from './voteFilter';
import type { MyVoteResponse } from '@/shared/queries/user';

type FilterValue = VoteStatus | 'all';
type MajorityStatus = 'majority' | 'minority' | 'tie';

const FILTER_LABELS: Record<VoteStatus, string> = {
  [VoteStatus.AGREE]: '찬성',
  [VoteStatus.DISAGREE]: '반대',
  [VoteStatus.NEUTRAL]: '중립',
};

/**
 * 내 투표가 다수/소수/동률인지 판별
 */
function getMajorityStatus(vote: MyVoteResponse): MajorityStatus {
  const post = vote.post;
  if (!post) return 'tie';

  const countMap = {
    [VoteStatus.AGREE]: post.agreeCount,
    [VoteStatus.DISAGREE]: post.disagreeCount,
    [VoteStatus.NEUTRAL]: post.neutralCount,
  };

  const myCount = countMap[vote.currentStatus];
  const maxCount = Math.max(post.agreeCount, post.disagreeCount, post.neutralCount);
  const maxStatuses = Object.values(countMap).filter((c) => c === maxCount);

  if (maxStatuses.length > 1 && myCount === maxCount) return 'tie';
  if (myCount === maxCount) return 'majority';
  return 'minority';
}

/**
 * 내 투표 내역 탭 — 필터 + 컴팩트 카드 + 무한스크롤
 */
export function MyVotesTab() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMyVotes();
  const [filter, setFilter] = useState<FilterValue>('all');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { entries } = useIntersectionObserver(loadMoreRef, { threshold: 0.5 });

  useEffect(() => {
    if (entries.length > 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entries, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allVotes = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const counts = useMemo(() => {
    return allVotes.reduce(
      (acc, vote) => {
        acc.all++;
        if (vote.currentStatus === VoteStatus.AGREE) acc.agree++;
        else if (vote.currentStatus === VoteStatus.DISAGREE) acc.disagree++;
        else acc.neutral++;
        return acc;
      },
      { all: 0, agree: 0, disagree: 0, neutral: 0 }
    );
  }, [allVotes]);

  const filteredVotes = useMemo(() => {
    if (filter === 'all') return allVotes;
    return allVotes.filter((vote) => vote.currentStatus === filter);
  }, [allVotes, filter]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-3 pb-3 pt-4">
        {/* 필터 스켈레톤 */}
        <div className="flex gap-2 px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 w-16 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
        {/* 카드 스켈레톤 */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
            <div className="flex gap-2">
              <div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="flex gap-[2px] rounded-full overflow-hidden">
              <div className="h-2 flex-[5] bg-muted animate-pulse rounded-l-full" />
              <div className="h-2 flex-[3] bg-muted/70 animate-pulse" />
              <div className="h-2 flex-[2] bg-muted/50 animate-pulse rounded-r-full" />
            </div>
            <div className="flex gap-3">
              <div className="h-3 w-14 bg-muted rounded animate-pulse" />
              <div className="h-3 w-10 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!allVotes.length) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        투표한 내역이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 px-3 pb-3 pt-4">
        <VoteFilter value={filter} onChange={setFilter} counts={counts} />

        {filteredVotes.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            {filter !== 'all'
              ? `${FILTER_LABELS[filter]} 투표가 없습니다.`
              : '투표한 내역이 없습니다.'}
          </div>
        ) : (
          filteredVotes.map((vote) => (
            <MyVoteCard
              key={vote.id}
              vote={vote}
              majorityStatus={getMajorityStatus(vote)}
            />
          ))
        )}
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
