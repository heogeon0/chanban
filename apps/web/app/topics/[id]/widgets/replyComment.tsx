"use client";

import { CommentReplyResponse } from "@chanban/shared-types";
import { UserAvatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
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
  const latestVote = reply.user.voteHistory.at(-1)?.toStatus;

  /**
   * 좋아요 버튼 클릭 핸들러
   */
  const handleLikeClick = () => {
    onLike?.(reply.id, reply.isLiked);
  };

  // 삭제된 답글 표시
  if (isDeleted) {
    return (
      <div className="bg-muted/30 border border-dashed rounded-lg p-4">
        <p className="text-muted-foreground text-sm">삭제된 답글입니다.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {/* 아바타 */}
      <UserAvatar user={reply.user} size="sm" />

      <div className="flex-1">
        {/* 답글 카드 */}
        <div className="bg-muted/50 rounded-xl p-4">
          {/* 헤더: 사용자 정보 및 메타데이터 */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-bold text-sm">{reply.user.nickname}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(reply.createdAt)}
            </span>

            {/* 투표 히스토리 뱃지 */}
            {latestVote && <VoteHistoryBadge status={latestVote} />}

            {/* 수정된 답글 표시 */}
            {reply.updatedAt !== reply.createdAt && (
              <span className="text-muted-foreground text-xs">(수정됨)</span>
            )}
          </div>

          {/* 답글 내용 */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {reply.content}
          </p>
        </div>

        {/* 액션 버튼 (좋아요만) */}
        <div className="flex items-center gap-4 mt-2 px-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
            onClick={handleLikeClick}
          >
            <Heart
              size={18}
              className={reply.isLiked ? "fill-current text-red-500" : ""}
            />
            좋아요{reply.likeCount > 0 && ` ${reply.likeCount}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
