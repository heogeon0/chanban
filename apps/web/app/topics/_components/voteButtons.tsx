"use client";

import { BanIcon, ChanIcon, ChongIcon } from "@/shared/ui/icons";
import { VoteStatus } from "@chanban/shared-types";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";

interface VoteButtonsProps {
  postId: string;
  onVote: (status: VoteStatus) => void;
  isPending?: boolean;
  onShowCommentForm?: () => void;
}

/**
 * 투표 버튼 컴포넌트 (찬성/중립/반대)
 * 투표 클릭 시 댓글 작성 폼을 표시하도록 유도
 *
 * @param postId - 투표할 포스트 ID
 * @param onVote - 투표 시 호출될 콜백 함수
 * @param isPending - 투표 진행 중 여부
 * @param onShowCommentForm - 투표 후 댓글 폼을 표시할 때 호출될 콜백
 */
export function VoteButtons({
  postId,
  onVote,
  isPending = false,
  onShowCommentForm,
}: VoteButtonsProps) {
  const [hasVoted, setHasVoted] = useState(false);

  /**
   * 투표 버튼 클릭 핸들러
   * 투표 후 댓글 작성 폼을 표시합니다.
   */
  const handleVote = (status: VoteStatus) => {
    onVote(status);
    setHasVoted(true);
    onShowCommentForm?.();
  };

  return (
    <div className="flex gap-3 justify-center">
      <Button
        variant="outline"
        size="lg"
        className="flex-1 flex flex-col items-center gap-2 h-auto py-4 border-opinion-agree hover:bg-opinion-agree/10 hover:border-opinion-agree"
        onClick={() => handleVote(VoteStatus.AGREE)}
        disabled={isPending || hasVoted}
      >
        <ChanIcon size={32} className="text-opinion-agree" />
        <span className="text-title-default font-semibold">찬성</span>
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="flex-1 flex flex-col items-center gap-2 h-auto py-4 border-opinion-neutral hover:bg-opinion-neutral/10 hover:border-opinion-neutral"
        onClick={() => handleVote(VoteStatus.NEUTRAL)}
        disabled={isPending || hasVoted}
      >
        <ChongIcon size={32} className="text-opinion-neutral" />
        <span className="text-title-default font-semibold">중립</span>
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="flex-1 flex flex-col items-center gap-2 h-auto py-4 border-opinion-disagree hover:bg-opinion-disagree/10 hover:border-opinion-disagree"
        onClick={() => handleVote(VoteStatus.DISAGREE)}
        disabled={isPending || hasVoted}
      >
        <BanIcon size={32} className="text-opinion-disagree" />
        <span className="text-title-default font-semibold">반대</span>
      </Button>
    </div>
  );
}
