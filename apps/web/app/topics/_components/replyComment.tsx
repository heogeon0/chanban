"use client";

import { CommentReplyResponse } from "@chanban/shared-types";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Heart } from "lucide-react";
import { VoteHistoryBadge, formatRelativeTime } from "./commentUtils";

interface ReplyCommentProps {
  reply: CommentReplyResponse;
  onLike?: (commentId: string, isLiked: boolean) => void;
}

/**
 * 답글 컴포넌트
 * 개별 답글을 표시하는 간단한 컴포넌트입니다.
 * 원댓글과 달리 답글 기능이 없고, 더 간단한 구조를 가집니다.
 *
 * @param reply - 답글 데이터
 * @param onLike - 좋아요 버튼 클릭 시 호출될 콜백
 */
export function ReplyComment({ reply, onLike }: ReplyCommentProps) {
  const isDeleted = reply.deletedAt !== null;
  const latestVote = reply.user.voteHistory[0]?.toStatus;

  /**
   * 좋아요 버튼 클릭 핸들러
   */
  const handleLikeClick = () => {
    onLike?.(reply.id, reply.isLiked);
  };

  // 삭제된 답글 표시
  if (isDeleted) {
    return (
      <div className="ml-12">
        <div className="bg-muted/50 border border-dashed rounded-lg p-4">
          <p className="text-muted-foreground text-body-default">
            삭제된 답글입니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-12">
      <div className="bg-card border rounded-lg p-4">
        {/* 헤더: 사용자 정보 및 메타데이터 */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="flex-shrink-0">
            <AvatarFallback>
              {reply.user.nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-body-default">
                {reply.user.nickname}
              </span>

              {/* 투표 히스토리 뱃지 */}
              {latestVote && <VoteHistoryBadge status={latestVote} />}

              <span className="text-muted-foreground text-caption-default">
                {formatRelativeTime(reply.createdAt)}
              </span>

              {/* 수정된 답글 표시 */}
              {reply.updatedAt !== reply.createdAt && (
                <span className="text-muted-foreground text-caption-default">
                  (수정됨)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 답글 내용 */}
        <div className="mb-3 ml-12">
          <p className="text-body-default whitespace-pre-wrap break-words">
            {reply.content}
          </p>
        </div>

        {/* 액션 버튼 (좋아요만) */}
        <div className="flex items-center gap-2 ml-12">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1.5"
            onClick={handleLikeClick}
          >
            <Heart
              size={16}
              className={reply.isLiked ? "fill-current text-red-500" : ""}
            />
            <span className="text-caption-default">좋아요</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
