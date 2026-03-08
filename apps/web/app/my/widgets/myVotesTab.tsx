'use client';

import { TopicCard } from '@/app/topics/widgets/topicCard';
import { userQueries } from '@/shared/queries';
import { Button } from '@/shared/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * 내 투표 내역 탭
 * TopicCard를 재사용하며 myVote prop으로 하단에 내 선택을 표시합니다.
 */
export function MyVotesTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(userQueries.myVotes(page));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4 p-4 desktop:p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        투표한 내역이 없습니다.
      </div>
    );
  }

  const totalPages = data.meta.totalPages;

  return (
    <div className="p-4 desktop:p-6">
      <div className="grid grid-cols-1 desktop:grid-cols-2 gap-4">
        {data.data.map((vote) => {
          if (!vote.post) return null;
          return (
            <TopicCard
              key={vote.id}
              post={vote.post}
              myVote={vote.currentStatus}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
