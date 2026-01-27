"use client";

import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { PaginationMeta, PostTag } from "@chanban/shared-types";
import { useEffect, useRef } from "react";
import { useGetInfiniteTopics } from "@/shared/queries";
import { TopicCard } from "./topicCard";

interface TopicListProps {
  tag: PostTag | 'recent' | 'hot';
  initialMeta: PaginationMeta;
}

/**
 * 무한스크롤이 적용된 토픽 목록 컴포넌트
 * 초기 데이터의 메타정보를 기반으로 다음 페이지가 있을 때만 fetch
 *
 * @param tag - 현재 선택된 태그
 * @param initialMeta - 서버에서 받아온 초기 페이지의 메타정보
 */
export function TopicList({ tag, initialMeta }: TopicListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useGetInfiniteTopics(tag, initialMeta);


  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { entries } = useIntersectionObserver(loadMoreRef, {
    threshold: 0.5,
  });

  useEffect(() => {
    if (entries.length > 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entries, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>게시글을 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm mt-2">{error instanceof Error ? error.message : '알 수 없는 오류'}</p>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap(page => page.data) ?? [];

  return (
    <>
      <div className="divide-y divide-border/50 desktop:divide-y-0 desktop:space-y-0">
        {allPosts.map((post) => (
          <TopicCard key={post.id} post={post} />
        ))}
      </div>

      {hasNextPage && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isFetchingNextPage ? (
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          ) : (
            <div className="text-sm text-muted-foreground">
              스크롤하여 더보기
            </div>
          )}
        </div>
      )}

      {!hasNextPage && allPosts.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          모든 게시글을 불러왔습니다
        </div>
      )}
    </>
  );
}
