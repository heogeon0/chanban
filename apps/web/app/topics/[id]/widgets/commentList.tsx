"use client";

import { CommentResponse } from "@chanban/shared-types";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Comment } from "./comment";

interface CommentListProps {
  comments: CommentResponse[];
  topicId: string;
  onLike?: (commentId: string, isLiked: boolean) => void;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

/**
 * 댓글 목록 컴포넌트
 * 댓글 배열을 받아 각 댓글을 렌더링합니다.
 * 무한 스크롤을 지원합니다.
 *
 * @param comments - 댓글 데이터 배열
 * @param topicId - 토픽 ID (답글 작성에 필요)
 * @param onLike - 좋아요 버튼 클릭 시 호출될 콜백 함수
 * @param isLoading - 초기 로딩 상태
 * @param hasNextPage - 다음 페이지 존재 여부
 * @param isFetchingNextPage - 다음 페이지 로딩 중 여부
 * @param onLoadMore - 다음 페이지 로드 함수
 */
export function CommentList({
  comments,
  topicId,
  onLike,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: CommentListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    if (!hasNextPage || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const target = loadMoreRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 댓글이 없는 경우
  if (comments.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-8 text-center">
        <p className="text-muted-foreground text-body-default">
          아직 댓글이 없습니다.
        </p>
      </div>
    );
  }

  // 댓글 목록 렌더링
  return (
    <div className="space-y-8">
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          topicId={topicId}
          onLike={onLike}
        />
      ))}

      {/* 무한 스크롤 트리거 */}
      <div ref={loadMoreRef} className="h-4" />

      {/* 다음 페이지 로딩 인디케이터 */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
