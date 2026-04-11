"use client";

import { VoteStatus } from "@chanban/shared-types";

interface VoteButtonsProps {
  onVote: (status: VoteStatus) => void;
  onShowCommentForm?: () => void;
  selectedStatus?: VoteStatus | null;
  disabled?: boolean;
}

/**
 * 투표 버튼 컴포넌트 (찬성/반대/중립)
 * 가로 배치, 틴트 배경, 선택 시 솔리드 컬러 + 그림자
 *
 * @param onVote - 투표 시 호출될 콜백 함수
 * @param onShowCommentForm - 투표 후 댓글 폼을 표시할 때 호출될 콜백
 * @param selectedStatus - 현재 선택된 투표 상태
 */
export function VoteButtons({
  onVote,
  onShowCommentForm,
  selectedStatus = null,
  disabled = false,
}: VoteButtonsProps) {
  const isAgreeSelected = selectedStatus === VoteStatus.AGREE;
  const isDisagreeSelected = selectedStatus === VoteStatus.DISAGREE;
  const isNeutralSelected = selectedStatus === VoteStatus.NEUTRAL;

  const handleVote = (status: VoteStatus) => {
    onVote(status);
    onShowCommentForm?.();
  };

  return (
    <div className="flex gap-2.5">
      {/* 찬성 버튼 */}
      <button
        type="button"
        disabled={disabled}
        className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-80 disabled:cursor-not-allowed ${
          isAgreeSelected
            ? "bg-opinion-agree text-white shadow-lg shadow-opinion-agree/30"
            : "bg-opinion-agree/15 text-opinion-agree hover:bg-opinion-agree/25"
        }`}
        onClick={() => handleVote(VoteStatus.AGREE)}
      >
        <span className="text-[15px] font-extrabold">찬성</span>
      </button>

      {/* 반대 버튼 */}
      <button
        type="button"
        disabled={disabled}
        className={`flex-1 h-12 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-80 disabled:cursor-not-allowed ${
          isDisagreeSelected
            ? "bg-opinion-disagree text-white shadow-lg shadow-opinion-disagree/30"
            : "bg-opinion-disagree/15 text-opinion-disagree hover:bg-opinion-disagree/25"
        }`}
        onClick={() => handleVote(VoteStatus.DISAGREE)}
      >
        <span className="text-[15px] font-extrabold">반대</span>
      </button>

      {/* 중립 버튼 */}
      <button
        type="button"
        disabled={disabled}
        className={`flex-[0.7] h-12 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-80 disabled:cursor-not-allowed ${
          isNeutralSelected
            ? "bg-muted-foreground text-white"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
        onClick={() => handleVote(VoteStatus.NEUTRAL)}
      >
        <span className="text-[14px] font-bold">중립</span>
      </button>
    </div>
  );
}
