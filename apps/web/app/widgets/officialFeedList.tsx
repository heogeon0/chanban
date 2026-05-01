"use client";

import { useGetInfiniteOfficialPosts } from "@/app/topics/features/use-infinite-official-posts";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { useAuth } from "@/shared/contexts/auth-context";
import {
  PaginatedResponse,
  PaginationMeta,
  PostResponse,
} from "@chanban/shared-types";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import Link from "next/link";
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
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    refetch,
  } = useGetInfiniteOfficialPosts(initialData.meta as PaginationMeta);
  const { isAdmin } = useAuth();

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
      <div className="px-3 py-16 flex flex-col items-center gap-3 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            피드를 불러오지 못했어요
          </p>
          <p className="text-xs text-muted-foreground">
            네트워크 상태를 확인하고 다시 시도해주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-1 inline-flex items-center px-4 h-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="px-3 py-16 flex flex-col items-center gap-3 text-center">
        <Inbox className="w-12 h-12 text-muted-foreground/50" />
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            아직 공식 투표가 없어요
          </p>
          <p className="text-sm text-muted-foreground">
            새로운 안건이 곧 올라옵니다.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/posts/create"
            className="mt-2 inline-flex items-center px-4 h-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            공식 투표 작성
          </Link>
        )}
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
          <Loader2
            className={`w-5 h-5 text-muted-foreground ${
              isFetchingNextPage ? "animate-spin" : "opacity-40"
            }`}
            aria-label={isFetchingNextPage ? "불러오는 중" : "더 불러올 수 있음"}
          />
        </div>
      )}

      {!hasNextPage && posts.length > 0 && (
        <div className="flex items-center justify-center gap-3 py-8 text-xs text-muted-foreground">
          <span className="h-px w-8 bg-border" />
          모두 불러왔습니다
          <span className="h-px w-8 bg-border" />
        </div>
      )}
    </div>
  );
}
