"use client";

import { TopicCard } from "@/app/topics/widgets/topicCard";
import { userQueries } from "@/shared/queries";
import { Button } from "@/shared/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface UserTopicsTabProps {
  userId: string;
}

/**
 * 특정 사용자가 작성한 토픽 목록
 */
export function UserTopicsTab({ userId }: UserTopicsTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(userQueries.userPosts(userId, page));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[160px] bg-muted animate-pulse rounded-sm" />
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
    <div className="w-full">
      <div className="flex flex-col gap-3 w-full">
        {data.data.map((post) => (
          <div key={post.id} className="w-full">
            <TopicCard post={post} />
          </div>
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
