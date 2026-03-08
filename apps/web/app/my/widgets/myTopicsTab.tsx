'use client';

import { TopicCard } from '@/app/topics/widgets/topicCard';
import { userQueries } from '@/shared/queries';
import { Button } from '@/shared/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * 내가 작성한 토픽 목록 탭
 * TopicCard를 재사용하며 페이지네이션을 지원합니다.
 */
export function MyTopicsTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(userQueries.myPosts(page));

  if (isLoading) {
    return (
      <div className="space-y-3 p-4 desktop:p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        작성한 토픽이 없습니다.
      </div>
    );
  }

  const totalPages = data.meta.totalPages;

  return (
    <div className="p-4 desktop:p-6">
      <div className="desktop:grid desktop:grid-cols-2 desktop:gap-4">
        {data.data.map((post) => (
          <TopicCard key={post.id} post={post} />
        ))}
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
