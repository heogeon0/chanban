"use client";

import { VoteStatus } from "@chanban/shared-types";
import { Scale, ThumbsDown, ThumbsUp } from "lucide-react";

interface VoteButtonsProps {
  postId: string;
  onVote: (status: VoteStatus) => void;
  isPending?: boolean;
  onShowCommentForm?: () => void;
  selectedStatus?: VoteStatus | null;
}

/**
 * 투표 버튼 컴포넌트 (찬성/반대/중립)
 * 투표 클릭 시 댓글 작성 폼을 표시하도록 유도
 *
 * @param postId - 투표할 포스트 ID
 * @param onVote - 투표 시 호출될 콜백 함수
 * @param isPending - 투표 진행 중 여부
 * @param onShowCommentForm - 투표 후 댓글 폼을 표시할 때 호출될 콜백
 * @param selectedStatus - 현재 선택된 투표 상태 (선택된 버튼에 테두리 표시)
 */
export function VoteButtons({
  onVote,
  isPending = false,
  onShowCommentForm,
  selectedStatus = null,
}: VoteButtonsProps) {
  const isAgreeSelected = selectedStatus === VoteStatus.AGREE;
  const isDisagreeSelected = selectedStatus === VoteStatus.DISAGREE;
  const isNeutralSelected = selectedStatus === VoteStatus.NEUTRAL;

  /** 선택된 버튼에 적용할 테두리 스타일 */
  const selectedRingClass = "ring-4 ring-foreground ring-offset-2";
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
        className={`flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl bg-opinion-agree hover:bg-opinion-agree/90 text-white transition-all transform hover:scale-[1.02] shadow-lg shadow-opinion-agree/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isAgreeSelected ? selectedRingClass : ""}`}
        onClick={() => handleVote(VoteStatus.AGREE)}
        disabled={isPending}
      >
        <ThumbsUp className="w-8 h-8" />
        <span className="text-lg font-bold">찬성</span>
      </button>

      {/* 반대 버튼 */}
      <button
        type="button"
        className={`flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl bg-destructive hover:bg-destructive/90 text-white transition-all transform hover:scale-[1.02] shadow-lg shadow-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isDisagreeSelected ? selectedRingClass : ""}`}
        onClick={() => handleVote(VoteStatus.DISAGREE)}
        disabled={isPending}
      >
        <ThumbsDown className="w-8 h-8" />
        <span className="text-lg font-bold">반대</span>
      </button>

      {/* 중립 버튼 */}
      <button
        type="button"
        className={`flex-1 flex flex-col items-center justify-center gap-2 py-6 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isNeutralSelected ? selectedRingClass : ""}`}
        onClick={() => handleVote(VoteStatus.NEUTRAL)}
        disabled={isPending}
      >
        <Scale className="w-8 h-8" />
        <span className="text-lg font-bold">중립</span>
      </button>
    </div>
  );
}
