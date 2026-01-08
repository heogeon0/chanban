"use client";

import { CommentResponse } from "@chanban/shared-types";
import { Comment } from "./comment";

interface CommentListProps {
  comments: CommentResponse[];
  onReply?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  isLoading?: boolean;
}

/**
 * 댓글 목록 컴포넌트
 * 댓글 배열을 받아 각 댓글을 렌더링합니다.
 *
 * @param comments - 댓글 데이터 배열
 * @param onReply - 답글 버튼 클릭 시 호출될 콜백 함수
 * @param onLike - 좋아요 버튼 클릭 시 호출될 콜백 함수
 * @param isLoading - 로딩 상태
 */
export function CommentList({
  comments,
  onReply,
  onLike,
  isLoading = false,
}: CommentListProps) {
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
    <div className="space-y-3">
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onLike={onLike}
        />
      ))}
    </div>
  );
}
