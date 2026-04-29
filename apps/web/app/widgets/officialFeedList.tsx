"use client";

import { useGetInfiniteOfficialPosts } from "@/app/topics/features/use-infinite-official-posts";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import {
  PaginatedResponse,
  PaginationMeta,
  PostResponse,
} from "@chanban/shared-types";
import { useEffect, useRef } from "react";
import { OfficialFeedCard } from "./officialFeedCard";

interface OfficialFeedListProps {
  initialData: PaginatedResponse<PostResponse>;
}

/**
 * 공식 투표 피드 리스트.
 * 세로 스크롤 + 무한스크롤. 카드 높이는 콘텐츠에 따라 가변.
 */
export function OfficialFeedList({ initialData }: OfficialFeedListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } =
    useGetInfiniteOfficialPosts(initialData.meta as PaginationMeta);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { entries } = useIntersectionObserver(loadMoreRef, { threshold: 0.5 });

  useEffect(() => {
    if (entries.length > 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entries, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = [
    ...initialData.data,
    ...(data?.pages.flatMap((page) => page.data) ?? []),
  ];

  if (isError) {
    return (
      <div className="p-6 text-center text-sm text-red-500">
        피드를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        아직 공개된 공식 투표가 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      {posts.map((post) => (
        <OfficialFeedCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-8">
          <span className="text-sm text-muted-foreground">
            {isFetchingNextPage ? "로딩 중..." : "스크롤하여 더보기"}
          </span>
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          모든 투표를 불러왔습니다
        </div>
      )}
    </div>
  );
}
