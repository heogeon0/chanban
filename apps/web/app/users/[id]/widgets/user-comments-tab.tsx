"use client";

import { formatRelativeTime } from "@/app/topics/[id]/widgets/commentUtils";
import { userQueries } from "@/shared/queries";
import { Button } from "@/shared/ui/button";
import { UserCommentResponse } from "@chanban/shared-types";
import { useQuery } from "@tanstack/react-query";
import { VoteBadge } from "@/shared/ui/voteBadge";
import { VoteStatus } from "@chanban/shared-types";
import { Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const VOTE_BORDER_CLASS: Record<VoteStatus, string> = {
  [VoteStatus.AGREE]: "border-l-opinion-agree",
  [VoteStatus.DISAGREE]: "border-l-opinion-disagree",
  [VoteStatus.NEUTRAL]: "border-l-opinion-neutral",
};

interface UserCommentsTabProps {
  userId: string;
}

function CommentCard({ comment }: { comment: UserCommentResponse }) {
  return (
    <Link
      href={`/topics/${comment.post.id}`}
      className={`w-full flex flex-col min-h-[160px] p-4 desktop:p-5 border-l-4 ${comment.myVote ? VOTE_BORDER_CLASS[comment.myVote] : "border-l-muted-foreground"} border border-border bg-card hover:bg-muted/40 transition-colors cursor-pointer rounded-sm`}
    >
      <div className="flex-1 flex flex-col">
        {/* 원글 제목 + 시간 */}
        <div className="flex justify-between items-center mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] desktop:text-xs font-semibold bg-muted text-primary line-clamp-1 max-w-[70%]">
            <MessageSquare className="w-3 h-3 shrink-0" />
            {comment.post.title}
          </span>
          <span className="text-[10px] desktop:text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* 의견 내용 */}
        <p className="text-sm desktop:text-base font-bold mb-2 line-clamp-2">
          {comment.content}
        </p>
      </div>

      {/* 하단: 투표 뱃지 + 좋아요 */}
      <div className="mt-3 flex items-center gap-3 text-[10px] desktop:text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 desktop:w-4 desktop:h-4" />
          {comment.likeCount}
        </span>
        {comment.myVote && (
          <span className="ml-auto">
            <VoteBadge status={comment.myVote} />
          </span>
        )}
      </div>
    </Link>
  );
}

/**
 * 특정 사용자가 작성한 의견(댓글) 목록
 */
export function UserCommentsTab({ userId }: UserCommentsTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(userQueries.userComments(userId, page));

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[160px] bg-muted animate-pulse rounded-sm" />
        ))}
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        작성한 의견이 없습니다.
      </div>
    );
  }

  const totalPages = data.meta.totalPages;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 w-full">
        {data.data.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
