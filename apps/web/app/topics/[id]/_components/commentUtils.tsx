import { BanIcon, ChanIcon, ChongIcon } from "@/shared/ui/icons";
import { VoteStatus } from "@chanban/shared-types";

/**
 * 투표 상태에 따른 뱃지 컴포넌트
 * 사용자의 투표 히스토리를 시각적으로 표시합니다.
 *
 * @param status - 투표 상태 (찬성/중립/반대)
 */
export function VoteHistoryBadge({ status }: { status: VoteStatus }) {
  const voteConfig = {
    [VoteStatus.AGREE]: {
      icon: ChanIcon,
      label: "찬성",
      className: "bg-opinion-agree/10 text-opinion-agree border-opinion-agree",
    },
    [VoteStatus.NEUTRAL]: {
      icon: ChongIcon,
      label: "중립",
      className: "bg-opinion-neutral/10 text-opinion-neutral border-opinion-neutral",
    },
    [VoteStatus.DISAGREE]: {
      icon: BanIcon,
      label: "반대",
      className: "bg-opinion-disagree/10 text-opinion-disagree border-opinion-disagree",
    },
  };

  const config = voteConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-caption-default font-medium ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

/**
 * 날짜를 상대적인 시간 형식으로 포맷팅합니다.
 * 예: "방금 전", "5분 전", "2시간 전", "3일 전"
 *
 * @param date - 포맷팅할 날짜
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return new Date(date).toLocaleDateString("ko-KR");
}
