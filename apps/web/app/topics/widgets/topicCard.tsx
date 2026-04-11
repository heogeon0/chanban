import { PostResponse, VoteStatus } from "@chanban/shared-types";
import { MessageSquare, Vote } from "lucide-react";
import Link from "next/link";
import { TAG_MAP } from "../domains/constants";
import { formatRelativeTime } from "@/app/topics/[id]/widgets/commentUtils";

const MY_VOTE_CONFIG = {
  [VoteStatus.AGREE]: {
    label: "찬성",
    className: "text-opinion-agree",
  },
  [VoteStatus.DISAGREE]: {
    label: "반대",
    className: "text-opinion-disagree",
  },
  [VoteStatus.NEUTRAL]: {
    label: "중립",
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
  isHot?: boolean;
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
export function TopicCard({ post, myVote, isHot = false }: TopicCardProps) {
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
      className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/10"
    >
      {/* 카테고리 & 작성자 의견 & 시간 */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {tagInfo.name}
          </span>
          {isHot && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
              🔥 HOT
            </span>
          )}
          {creatorOpinion && (
            <span className={`text-[10px] font-semibold ${creatorOpinion.className}`}>
              {creatorOpinion.label}
            </span>
          )}
        </div>
        <span className="text-[12px] text-muted-foreground">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* 제목 */}
      <h3 className="text-[15px] font-semibold leading-snug mb-3 line-clamp-2">
        {post.title}
      </h3>

      {/* 찬반 분포 바 — 퍼센트 내장 */}
      <div className="flex gap-[3px] mb-3 rounded-lg overflow-hidden">
        <div
          className="h-[28px] flex items-center bg-opinion-agree rounded-l-lg"
          style={{ flex: agreePercent, paddingLeft: agreePercent > 15 ? '8px' : '2px' }}
        >
          {agreePercent > 15 && (
            <span className="text-[12px] font-bold text-white">{agreePercent}%</span>
          )}
        </div>
        <div
          className="h-[28px] flex items-center justify-end bg-opinion-disagree"
          style={{ flex: disagreePercent, paddingRight: disagreePercent > 15 ? '8px' : '2px' }}
        >
          {disagreePercent > 15 && (
            <span className="text-[12px] font-bold text-white">{disagreePercent}%</span>
          )}
        </div>
        <div
          className="h-[28px] flex items-center justify-center bg-muted rounded-r-lg"
          style={{ flex: neutralPercent }}
        >
          {neutralPercent > 8 && (
            <span className="text-[12px] font-semibold text-muted-foreground">{neutralPercent}%</span>
          )}
        </div>
      </div>

      {/* 투표 수 & 댓글 수 & 내 선택 */}
      <div className="flex items-center gap-3 pt-2.5 text-[11px] font-medium text-muted-foreground border-t border-border">
        <span className="flex items-center gap-1">
          <Vote className="w-3 h-3" />
          {formatCount(total)}명 투표
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {formatCount(post.commentCount)}
        </span>
        {myVote && (() => {
          const { label, className } = MY_VOTE_CONFIG[myVote];
          return (
            <span className={`ml-auto font-semibold ${className}`}>
              내 선택: {label}
            </span>
          );
        })()}
      </div>
    </Link>
  );
}
