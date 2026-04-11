'use client';

import { UserCommentResponse, VoteStatus } from '@chanban/shared-types';
import { Heart, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useInfiniteMyComments } from '../features/use-infinite-my-comments';
import { formatRelativeTime } from '@/app/topics/[id]/widgets/commentUtils';

const VOTE_BADGE_CONFIG = {
  [VoteStatus.AGREE]: { label: '찬성', className: 'bg-opinion-agree/10 text-opinion-agree' },
  [VoteStatus.DISAGREE]: { label: '반대', className: 'bg-opinion-disagree/10 text-opinion-disagree' },
  [VoteStatus.NEUTRAL]: { label: '중립', className: 'bg-muted text-muted-foreground' },
} as const;

/**
 * 마이페이지 댓글 카드 — 투표 배지 + 댓글 내용 + 원글 제목
 */
function MyCommentCard({ comment }: { comment: UserCommentResponse }) {
  return (
    <Link
      href={`/topics/${comment.post.id}`}
      className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/10"
    >
        {/* 원글 제목 배지 + 시간 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-primary line-clamp-1 max-w-[70%]">
            <MessageSquare className="w-3 h-3 shrink-0" />
            <span className="truncate">{comment.post.title}</span>
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* 댓글 내용 */}
        <p className="text-[14px] font-semibold leading-snug mb-3 line-clamp-2">
          {comment.content}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {comment.likeCount}
          </span>
          {comment.myVote && (
            <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${VOTE_BADGE_CONFIG[comment.myVote].className}`}>
              {VOTE_BADGE_CONFIG[comment.myVote].label}
            </span>
          )}
        </div>
    </Link>
  );
}

/**
 * 내 의견(댓글) 탭 — 무한스크롤
 */
export function MyCommentsTab() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteMyComments(userId);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { entries } = useIntersectionObserver(loadMoreRef, { threshold: 0.5 });

  useEffect(() => {
    if (entries.length > 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entries, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-3 pb-3 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2.5">
            <div className="flex justify-between">
              <div className="h-5 w-40 bg-muted rounded-full animate-pulse" />
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-3 w-10 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const allComments = data?.pages.flatMap((page) => page.data) ?? [];

  if (!allComments.length) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        작성한 의견이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 px-3 pb-3 pt-4">
        {allComments.map((comment) => (
          <MyCommentCard key={comment.id} comment={comment} />
        ))}
      </div>
      <div ref={loadMoreRef} className="flex items-center justify-center py-8">
        {isFetchingNextPage ? (
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        ) : !hasNextPage ? (
          <p className="text-sm text-muted-foreground">모든 항목을 불러왔습니다</p>
        ) : null}
      </div>
    </>
  );
}
