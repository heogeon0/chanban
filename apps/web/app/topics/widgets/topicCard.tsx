import { PostResponse, VoteStatus } from "@chanban/shared-types";
import { CheckCircle2, MessageSquare, Minus, Vote, XCircle } from "lucide-react";
import Link from "next/link";
import { TAG_MAP } from "../domains/constants";
import { formatRelativeTime } from "@/app/topics/[id]/widgets/commentUtils";

const MY_VOTE_CONFIG = {
  [VoteStatus.AGREE]: {
    label: "찬성",
    Icon: CheckCircle2,
    className: "text-opinion-agree",
  },
  [VoteStatus.DISAGREE]: {
    label: "반대",
    Icon: XCircle,
    className: "text-opinion-disagree",
  },
  [VoteStatus.NEUTRAL]: {
    label: "중립",
    Icon: Minus,
    className: "text-opinion-neutral",
  },
} as const;

const CREATOR_OPINION_CONFIG = {
  [VoteStatus.AGREE]: { label: "찬성", className: "text-opinion-agree" },
  [VoteStatus.DISAGREE]: { label: "반대", className: "text-opinion-disagree" },
  [VoteStatus.NEUTRAL]: { label: "중립", className: "text-opinion-neutral" },
} as const;

interface TopicCardProps {
  post: PostResponse;
  myVote?: VoteStatus;
}

/**
 * 숫자를 포맷팅합니다 (1000 -> 1k)
 * @param num - 포맷팅할 숫자
 * @returns 포맷팅된 문자열
 */
const formatCount = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

/**
 * 토픽 목록에서 사용되는 카드 컴포넌트
 * 블라인드형 리스트 + 찬반 % 분포 강조 디자인
 *
 * @param post - 게시글 데이터
 */
export function TopicCard({ post, myVote }: TopicCardProps) {
  const total = post.agreeCount + post.disagreeCount + post.neutralCount;
  const agreePercent =
    total === 0 ? 33 : Math.round((post.agreeCount / total) * 100);
  const neutralPercent =
    total === 0 ? 34 : Math.round((post.neutralCount / total) * 100);
  const disagreePercent = total === 0 ? 33 : 100 - agreePercent - neutralPercent;

  const tagInfo = TAG_MAP[post.tag] || { name: post.tag };
  const creatorOpinion =
    post.showCreatorOpinion && post.creatorVote
      ? CREATOR_OPINION_CONFIG[post.creatorVote]
      : null;

  return (
    <Link
      href={`/topics/${post.id}`}
      className="block px-4 py-4 hover:bg-muted/30 transition-colors"
    >
      {/* 카테고리 & 작성자 의견 & 시간 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-primary">{tagInfo.name}</span>
          {creatorOpinion && (
            <span className={`text-[10px] font-semibold ${creatorOpinion.className}`}>
              · {creatorOpinion.label}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* 제목 */}
      <h3 className="text-sm font-bold leading-snug mb-3 line-clamp-2">
        {post.title}
      </h3>

      {/* 찬반 분포 — 핵심 정보 */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] font-semibold mb-1">
          <span className="text-opinion-agree">찬성 {agreePercent}%</span>
          <span className="text-muted-foreground">중립 {neutralPercent}%</span>
          <span className="text-opinion-disagree">반대 {disagreePercent}%</span>
        </div>
        <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-muted">
          <div
            className="bg-opinion-agree h-full transition-all"
            style={{ width: `${agreePercent}%` }}
          />
          <div
            className="bg-muted-foreground/40 h-full transition-all"
            style={{ width: `${neutralPercent}%` }}
          />
          <div
            className="bg-opinion-disagree h-full transition-all"
            style={{ width: `${disagreePercent}%` }}
          />
        </div>
      </div>

      {/* 투표 수 & 댓글 수 & 내 선택 */}
      <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
        <span className="flex items-center gap-1">
          <Vote className="w-3 h-3" />
          {formatCount(total)}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {formatCount(post.commentCount)}
        </span>
        {myVote && (() => {
          const { Icon, label, className } = MY_VOTE_CONFIG[myVote];
          return (
            <span className={`ml-auto flex items-center gap-1 font-semibold ${className}`}>
              <Icon className="w-3 h-3" />
              내 선택: {label}
            </span>
          );
        })()}
      </div>
    </Link>
  );
}
