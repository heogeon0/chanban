"use client";

import { CommentReplyResponse, VoteStatus } from "@chanban/shared-types";
import { Button } from "@/shared/ui/button";
import { Heart } from "lucide-react";
import { VoteHistoryBadge, formatRelativeTime } from "./commentUtils";
import { FollowButton } from "@/shared/components/follow-button";
import { ImageGallery } from "@/shared/components/imageGallery/imageGallery";
import Link from "next/link";

interface ReplyCommentProps {
  reply: CommentReplyResponse;
  onLike?: (commentId: string, isLiked: boolean) => void;
}

/** 투표 상태에 따른 컬러바 배경 클래스 */
const getStanceBarClass = (vote: VoteStatus | undefined) => {
  if (vote === VoteStatus.AGREE) return "bg-opinion-agree";
  if (vote === VoteStatus.DISAGREE) return "bg-opinion-disagree";
  return "bg-muted-foreground";
};

/**
 * 답글 컴포넌트
 * 좌측 3px 컬러바로 입장을 시각화합니다.
 *
 * @param reply - 답글 데이터
 * @param onLike - 좋아요 버튼 클릭 시 호출될 콜백
 */
export function ReplyComment({ reply, onLike }: ReplyCommentProps) {
  const isDeleted = reply.deletedAt !== null;
  const latestVote = reply.user.voteHistory.at(-1)?.toStatus;
  const stanceBarClass = getStanceBarClass(latestVote);

  const handleLikeClick = () => {
    onLike?.(reply.id, reply.isLiked);
  };

  // 삭제된 답글 표시
  if (isDeleted) {
    return (
      <div className="flex gap-0">
        <div className="w-[3px] rounded-l-lg shrink-0 bg-muted-foreground/30" />
        <div className="flex-1 px-3 py-2.5 rounded-r-lg border border-l-0 border-border bg-card">
          <p className="text-muted-foreground text-[12px]">삭제된 답글입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-0">
      {/* 좌측 3px 컬러바 */}
      <div className={`w-[3px] rounded-l-lg shrink-0 opacity-60 ${stanceBarClass}`} />

      {/* 답글 카드 */}
      <div className="flex-1 px-3 py-2.5 rounded-r-lg border border-l-0 border-border bg-card">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {/* 닉네임 첫 글자 배지 */}
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 opacity-80 ${stanceBarClass}`}>
            {reply.user.nickname.charAt(0)}
          </span>
          <Link href={`/users/${reply.user.id}`} className="font-semibold text-[12px] hover:underline">
            {reply.user.nickname}
          </Link>
          <span className="text-[10px] text-muted-foreground">
            {formatRelativeTime(reply.createdAt)}
          </span>
          {latestVote && <VoteHistoryBadge status={latestVote} />}
          {reply.updatedAt !== reply.createdAt && (
            <span className="text-muted-foreground text-[10px]">(수정됨)</span>
          )}
          <FollowButton userId={reply.user.id} />
        </div>

        {/* 답글 내용 */}
        <p className="text-[12px] leading-relaxed whitespace-pre-wrap break-words mb-1.5">
          {reply.content}
        </p>

        {/* 답글 이미지 */}
        {reply.images && reply.images.length > 0 && (
          <ImageGallery
            images={reply.images}
            variant="compact"
            className="mb-1.5"
          />
        )}

        {/* 좋아요 버튼 */}
        <button
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          onClick={handleLikeClick}
        >
          <Heart
            size={12}
            className={reply.isLiked ? "fill-current text-red-500" : ""}
          />
          <span className="text-[11px]">{reply.likeCount > 0 ? reply.likeCount : "좋아요"}</span>
        </button>
      </div>
    </div>
  );
}
