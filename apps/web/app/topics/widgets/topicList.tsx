"use client";

import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import {
  PaginatedResponse,
  PostResponse,
  PostTag,
} from "@chanban/shared-types";
import { useEffect, useRef } from "react";
import { useGetInfiniteTopics } from "../features";
import { TopicCard } from "./topicCard";

interface TopicListProps {
  tag: PostTag | "recent" | "hot";
  /** 서버에서 pre-fetch한 1페이지 — useInfiniteQuery에 initialData로 시드 */
  initialPage: PaginatedResponse<PostResponse>;
  excludeIds?: string[];
}

/**
 * 무한스크롤이 적용된 토픽 목록 컴포넌트.
 * 1페이지는 TopicsContent(RSC)가 이미 렌더하므로, 여기서는 2페이지 이후만 렌더한다.
 * excludeIds는 HOT 섹션에 이미 표시된 게시글 ID를 추가로 제외할 때 사용.
 */
export function TopicList({ tag, initialPage, excludeIds = [] }: TopicListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
  } = useGetInfiniteTopics(tag, initialPage);

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
        <p className="text-sm mt-2">
          {error instanceof Error ? error.message : "알 수 없는 오류"}
        </p>
      </div>
    );
  }

  // pages[0]은 TopicsContent가 RSC 렌더 중이므로 중복 방지를 위해 제외
  const extraPages = (data?.pages ?? []).slice(1);
  const extraPosts = extraPages
    .flatMap((page) => page.data)
    .filter((post) => !excludeIds.includes(post.id));

  return (
    <>
      <div className="flex flex-col gap-3 px-3 pb-3">
        {extraPosts.map((post) => (
          <TopicCard key={post.id} post={post} />
        ))}
      </div>

      {hasNextPage && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-8">
          {isFetchingNextPage ? (
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          ) : (
            <div className="text-sm text-muted-foreground">스크롤하여 더보기</div>
          )}
        </div>
      )}

      {!hasNextPage && extraPages.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          모든 게시글을 불러왔습니다
        </div>
      )}
    </>
  );
}
