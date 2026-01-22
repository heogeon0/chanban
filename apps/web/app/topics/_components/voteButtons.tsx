"use client";

import { VoteStatus } from "@chanban/shared-types";
import { Scale, ThumbsDown, ThumbsUp } from "lucide-react";

interface VoteButtonsProps {
  postId: string;
  onVote: (status: VoteStatus) => void;
  isPending?: boolean;
  onShowCommentForm?: () => void;
}

/**
 * 투표 버튼 컴포넌트 (찬성/반대/중립)
 * 투표 클릭 시 댓글 작성 폼을 표시하도록 유도
 *
 * @param postId - 투표할 포스트 ID
 * @param onVote - 투표 시 호출될 콜백 함수
 * @param isPending - 투표 진행 중 여부
 * @param onShowCommentForm - 투표 후 댓글 폼을 표시할 때 호출될 콜백
 */
export function VoteButtons({
  onVote,
  isPending = false,
  onShowCommentForm,
}: VoteButtonsProps) {
  /**
   * 투표 버튼 클릭 핸들러
   * 투표 후 댓글 작성 폼을 표시합니다.
   */
  const handleVote = (status: VoteStatus) => {
    onVote(status);
    onShowCommentForm?.();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* 찬성 버튼 */}
      <button
        type="button"
        className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        onClick={() => handleVote(VoteStatus.AGREE)}
        disabled={isPending}
      >
        <ThumbsUp className="w-8 h-8" />
        <span className="text-lg font-bold">찬성</span>
      </button>

      {/* 반대 버튼 */}
      <button
        type="button"
        className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl bg-destructive hover:bg-destructive/90 text-white transition-all transform hover:scale-[1.02] shadow-lg shadow-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        onClick={() => handleVote(VoteStatus.DISAGREE)}
        disabled={isPending}
      >
        <ThumbsDown className="w-8 h-8" />
        <span className="text-lg font-bold">반대</span>
      </button>

      {/* 중립 버튼 */}
      <button
        type="button"
        className="flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        onClick={() => handleVote(VoteStatus.NEUTRAL)}
        disabled={isPending}
      >
        <Scale className="w-8 h-8" />
        <span className="text-lg font-bold">중립</span>
      </button>
    </div>
  );
}
