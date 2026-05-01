import { VoteStatus } from '@chanban/shared-types';
import { MessageSquare, Vote } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/app/topics/[id]/widgets/commentUtils';
import type { MyVoteResponse } from '@/shared/queries/user';

const VOTE_STATUS_CONFIG = {
  [VoteStatus.AGREE]: {
    label: '찬성',
    badgeClass: 'bg-opinion-agree/10 text-opinion-agree',
  },
  [VoteStatus.DISAGREE]: {
    label: '반대',
    badgeClass: 'bg-opinion-disagree/10 text-opinion-disagree',
  },
  [VoteStatus.NEUTRAL]: {
    label: '중립',
    badgeClass: 'bg-muted text-muted-foreground',
  },
} as const;

const MAJORITY_CONFIG = {
  majority: {
    label: '다수 의견',
    className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  minority: {
    label: '소수 의견',
    className: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
  tie: {
    label: '동률',
    className: 'bg-muted text-muted-foreground',
  },
} as const;

type MajorityStatus = 'majority' | 'minority' | 'tie';

interface MyVoteCardProps {
  vote: MyVoteResponse;
  majorityStatus?: MajorityStatus;
}

/**
 * 포맷팅: 1000 → 1k
 */
const formatCount = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

/**
 * 마이페이지 투표 전용 컴팩트 카드
 * 좌측 컬러바 + 투표 배지 + 다수/소수 인사이트 + 축소 찬반 바
 */
export function MyVoteCard({ vote, majorityStatus }: MyVoteCardProps) {
  const post = vote.post;
  if (!post) return null;

  const statusConfig = VOTE_STATUS_CONFIG[vote.currentStatus];
  const total = post.agreeCount + post.disagreeCount;
  const agreePercent = total === 0 ? 50 : Math.round((post.agreeCount / total) * 100);
  const disagreePercent = total === 0 ? 50 : 100 - agreePercent;

  return (
    <Link
      href={`/topics/${post.id}`}
      className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/10"
    >
        {/* 헤더: 배지 + 인사이트 + 시각 */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${statusConfig.badgeClass}`}>
            {statusConfig.label}
          </span>
          {majorityStatus && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${MAJORITY_CONFIG[majorityStatus].className}`}>
              {MAJORITY_CONFIG[majorityStatus].label}
            </span>
          )}
          <span className="ml-auto text-[11px] text-muted-foreground shrink-0">
            {formatRelativeTime(vote.firstVotedAt)}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="text-[15px] font-semibold leading-snug mb-3 line-clamp-2">
          {post.title}
        </h3>

        {/* 축소 찬반 바 */}
        <div className="flex gap-[2px] mb-3 rounded-full overflow-hidden">
          <div
            className="h-2 bg-opinion-agree rounded-l-full"
            style={{ flex: agreePercent }}
          />
          <div
            className="h-2 bg-opinion-disagree rounded-r-full"
            style={{ flex: disagreePercent }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <Vote className="w-3 h-3" />
            {formatCount(total)}명 투표
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {formatCount(post.commentCount)}
          </span>
        </div>
    </Link>
  );
}
