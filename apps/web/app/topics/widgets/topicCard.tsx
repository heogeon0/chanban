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

/**
 * 작성자의 의견에 따른 border 색상 클래스를 반환합니다.
 * @param opinion - 작성자의 의견 (agree, disagree, neutral, null)
 * @param showOpinion - 의견 공개 여부
 * @returns Tailwind border 색상 클래스
 */
const getOpinionBorderClass = (
  opinion: VoteStatus | null,
  showOpinion: boolean
): string => {
  if (!showOpinion || opinion === null) {
    return "border-t-muted-foreground desktop:border-t-border desktop:border-l-muted-foreground";
  }

  const borderClassMap: Record<VoteStatus, string> = {
    [VoteStatus.AGREE]: "border-t-opinion-agree desktop:border-t-border desktop:border-l-opinion-agree",
    [VoteStatus.DISAGREE]: "border-t-opinion-disagree desktop:border-t-border desktop:border-l-opinion-disagree",
    [VoteStatus.NEUTRAL]: "border-t-opinion-neutral desktop:border-t-border desktop:border-l-opinion-neutral",
  };

  return borderClassMap[opinion];
};

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
 * 왼쪽 보더 + 3색 프로그레스 바 디자인
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

  const tagInfo = TAG_MAP[post.tag] || { name: post.tag, variant: "default" };
  const borderColorClass = getOpinionBorderClass(
    post.creatorVote ?? null,
    post.showCreatorOpinion
  );

  return (
    <Link
      href={`/topics/${post.id}`}
      className={`flex flex-col p-4 desktop:p-5 border-t-2 desktop:border-t desktop:border-l-4 ${borderColorClass} hover:bg-muted/40 transition-colors cursor-pointer desktop:border desktop:border-border desktop:bg-card desktop:mb-3`}
    >
      {/* 상단: 카테고리/시간 + 제목 + 설명 — flex-1로 가변 공간 차지 */}
      <div className="flex-1 flex flex-col">
        {/* 카테고리 & 시간 */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] desktop:text-xs font-bold text-primary uppercase tracking-wide">
            {tagInfo.name}
          </span>
          <span className="text-[10px] desktop:text-xs text-muted-foreground">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-sm desktop:text-base font-bold mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* 내용 미리보기 - 데스크탑에서만 표시 */}
        <p className="hidden desktop:block text-sm text-muted-foreground line-clamp-2">
          {post.content}
        </p>
      </div>

      {/* 하단: 프로그레스 바 + 메타 — 항상 카드 바닥에 위치 */}
      <div className="mt-3">
        {/* 3색 프로그레스 바 */}
        <div className="flex h-1.5 desktop:h-2 w-full rounded-full overflow-hidden bg-muted mb-3">
          <div
            className="bg-opinion-agree h-full transition-all"
            style={{ width: `${agreePercent}%` }}
          />
          <div
            className="bg-muted-foreground h-full transition-all"
            style={{ width: `${neutralPercent}%` }}
          />
          <div
            className="bg-destructive h-full transition-all"
            style={{ width: `${disagreePercent}%` }}
          />
        </div>

        {/* 투표 수 & 댓글 수 & 내 선택 */}
        <div className="flex items-center gap-3 text-[10px] desktop:text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <Vote className="w-3.5 h-3.5 desktop:w-4 desktop:h-4" />
            {formatCount(total)}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 desktop:w-4 desktop:h-4" />
            {formatCount(post.commentCount)}
          </span>
          {myVote && (() => {
            const { Icon, label, className } = MY_VOTE_CONFIG[myVote];
            return (
              <span className={`ml-auto flex items-center gap-1 font-semibold ${className}`}>
                <Icon className="w-3.5 h-3.5 desktop:w-4 desktop:h-4" />
                내 선택: {label}
              </span>
            );
          })()}
        </div>
      </div>
    </Link>
  );
}
