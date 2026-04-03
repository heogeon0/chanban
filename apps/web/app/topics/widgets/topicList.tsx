"use client";

import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { PaginationMeta, PostTag } from "@chanban/shared-types";
import { useEffect, useRef } from "react";
import { useGetInfiniteTopics } from "../features";
import { TopicCard } from "./topicCard";

interface TopicListProps {
  tag: PostTag | "recent" | "hot";
  initialMeta: PaginationMeta;
  excludeIds?: string[];
}

/**
 * 무한스크롤이 적용된 토픽 목록 컴포넌트
 * excludeIds: HOT 섹션에 이미 표시된 게시글 ID를 중복 제외
 *
 * @param tag - 현재 선택된 태그
 * @param initialMeta - 서버에서 받아온 초기 페이지의 메타정보
 * @param excludeIds - 렌더링에서 제외할 게시글 ID 목록
 */
export function TopicList({ tag, initialMeta, excludeIds = [] }: TopicListProps) {
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
        <p className="text-sm mt-2">{error instanceof Error ? error.message : "알 수 없는 오류"}</p>
      </div>
    );
  }

  const allPosts = (data?.pages.flatMap((page) => page.data) ?? []).filter(
    (post) => !excludeIds.includes(post.id)
  );

  return (
    <>
      <div className="flex flex-col gap-3 px-3 pb-3">
        {allPosts.map((post) => (
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

      {!hasNextPage && allPosts.length > 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          모든 게시글을 불러왔습니다
        </div>
      )}
    </>
  );
}
