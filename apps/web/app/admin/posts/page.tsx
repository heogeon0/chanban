"use client";

import { topicDomains } from "@/app/topics/domains";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { Button } from "@/shared/ui/button";
import { queryKeys } from "@/shared/queries/keys";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, Inbox, Loader2, PenSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { OfficialPostAdminRow } from "../widgets/officialPostAdminRow";

const PAGE_SIZE = 20;
const FIRST_PAGE = 1;

/**
 * 어드민 공식 토론 전체 목록.
 * 무한 스크롤. 각 행에서 상세 이동/수정/삭제 가능.
 */
export default function AdminOfficialPostsListPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: queryKeys.topic.officialInfinite(),
    queryFn: ({ pageParam }) =>
      topicDomains.getOfficialPosts(pageParam, PAGE_SIZE),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { entries } = useIntersectionObserver(loadMoreRef, { threshold: 0.5 });

  useEffect(() => {
    if (entries.length > 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entries, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">공식 토론 목록</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            작성된 공식 토론을 수정하거나 삭제할 수 있습니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/create">
            <PenSquare className="w-4 h-4 mr-2" />
            새 토론 작성
          </Link>
        </Button>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            목록을 불러오지 못했습니다.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Inbox className="w-10 h-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            아직 작성된 공식 토론이 없습니다.
          </p>
          <Button asChild>
            <Link href="/admin/posts/create">
              <PenSquare className="w-4 h-4 mr-2" />
              첫 토론 작성하기
            </Link>
          </Button>
        </div>
      )}

      {posts.length > 0 && (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.id}>
              <OfficialPostAdminRow post={post} />
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <div ref={loadMoreRef} className="flex items-center justify-center py-6">
          <Loader2
            className={`w-5 h-5 text-muted-foreground ${
              isFetchingNextPage ? "animate-spin" : "opacity-40"
            }`}
            aria-label={isFetchingNextPage ? "불러오는 중" : "더 불러올 수 있음"}
          />
        </div>
      )}
    </div>
  );
}
