import { VoteStatus } from "@chanban/shared-types";

const VOTE_CONFIG = {
  [VoteStatus.AGREE]: {
    label: "찬성",
    className: "bg-opinion-agree/15 text-opinion-agree",
  },
  [VoteStatus.NEUTRAL]: {
    label: "중립",
    className: "bg-opinion-neutral/15 text-opinion-neutral",
  },
  [VoteStatus.DISAGREE]: {
    label: "반대",
    className: "bg-opinion-disagree/15 text-opinion-disagree",
  },
};

/**
 * 투표 상태에 따른 뱃지 컴포넌트
 * 사용자의 투표 상태를 시각적으로 표시합니다.
 *
 * @param status - 투표 상태 (찬성/중립/반대)
 */
export function VoteBadge({ status }: { status: VoteStatus }) {
  const config = VOTE_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-1.5 rounded-full text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
