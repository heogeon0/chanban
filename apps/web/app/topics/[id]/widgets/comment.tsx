"use client";

import { CommentReplyResponse, CommentResponse, VoteStatus } from "@chanban/shared-types";
import { Button } from "@/shared/ui/button";
import { ChevronDown, Heart, MessageCircle, Reply } from "lucide-react";
import { useEffect, useState } from "react";
import { commentQueries } from "@/shared/queries";
import { useQuery } from "@tanstack/react-query";
import { VoteHistoryBadge, formatRelativeTime } from "./commentUtils";
import { ReplyComment } from "./replyComment";
import { CommentForm } from "./commentForm";
import { FollowButton } from "@/shared/components/follow-button";
import { ImageGallery } from "@/shared/components/imageGallery/imageGallery";
import Link from "next/link";

interface CommentProps {
  comment: CommentResponse;
  topicId: string;
  onLike?: (commentId: string, isLiked: boolean) => void;
}

/** 투표 상태에 따른 컬러바 배경 클래스 */
const getStanceBarClass = (vote: VoteStatus | undefined) => {
  if (vote === VoteStatus.AGREE) return "bg-opinion-agree";
  if (vote === VoteStatus.DISAGREE) return "bg-opinion-disagree";
  return "bg-muted-foreground";
};

/** 투표 상태에 따른 아바타 배지 배경 클래스 */
const getStanceBgClass = (vote: VoteStatus | undefined) => {
  if (vote === VoteStatus.AGREE) return "bg-opinion-agree";
  if (vote === VoteStatus.DISAGREE) return "bg-opinion-disagree";
  return "bg-muted-foreground";
};

/**
 * 댓글 컴포넌트
 * 좌측 컬러바로 찬/반/중립 입장을 시각화합니다.
 *
 * @param comment - 댓글 데이터
 * @param topicId - 토픽 ID (답글 작성에 필요)
 * @param onLike - 좋아요 버튼 클릭 시 호출될 콜백 함수
 */
export function Comment({ comment, topicId, onLike }: CommentProps) {
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [additionalReplies, setAdditionalReplies] = useState<CommentReplyResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadMoreEnabled, setLoadMoreEnabled] = useState(false);

  const isDeleted = comment.deletedAt !== null;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const latestVote = comment.user.voteHistory.at(-1)?.toStatus;

  const stanceBarClass = getStanceBarClass(latestVote);
  const stanceBgClass = getStanceBgClass(latestVote);

  // 답글 더보기를 위한 쿼리
  const { data: moreReplies, isLoading: isLoadingMoreReplies } = useQuery({
    ...commentQueries.replies(comment.id, currentPage),
    enabled: loadMoreEnabled && !!comment.id,
  });

  // 추가 답글 로드 완료 시 상태 업데이트 (중복 제거)
  useEffect(() => {
    if (moreReplies && moreReplies.length > 0) {
      setAdditionalReplies((prev) => {
        const existingIds = new Set([
          ...prev.map((r) => r.id),
          ...comment.replies.map((r) => r.id),
        ]);
        const newReplies = moreReplies.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newReplies];
      });
      setLoadMoreEnabled(false);
    }
  }, [moreReplies, comment.replies]);

  const currentReplyCount = comment.replies.length + additionalReplies.length;
  const hasMoreReplies = comment.totalReplies > currentReplyCount;
  const remainingReplies = comment.totalReplies - currentReplyCount;

  const handleReplyClick = () => {
    setShowReplyForm((prev) => !prev);
    if (!showReplyForm) {
      setShowReplies(true);
    }
  };

  const handleLikeClick = () => {
    onLike?.(comment.id, comment.isLiked);
  };

  const toggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

  const handleLoadMoreReplies = () => {
    setCurrentPage((prev) => prev + 1);
    setLoadMoreEnabled(true);
  };

  // 삭제된 댓글 표시
  if (isDeleted) {
    return (
      <div>
        <div className="flex gap-0">
          <div className="w-1 rounded-l-xl shrink-0 bg-muted-foreground/40" />
          <div className="flex-1 p-3 rounded-r-xl border border-l-0 border-border bg-card">
            <p className="text-muted-foreground text-sm">삭제된 댓글입니다.</p>
          </div>
        </div>

        {hasReplies && showReplies && (
          <div className="ml-5 mt-1.5 space-y-1.5">
            {additionalReplies.map((reply) => (
              <ReplyComment key={reply.id} reply={reply} onLike={onLike} />
            ))}
            {hasMoreReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-muted-foreground hover:text-foreground"
                onClick={handleLoadMoreReplies}
                disabled={isLoadingMoreReplies}
              >
                <ChevronDown size={16} className="mr-1" />
                <span className="text-xs">
                  {isLoadingMoreReplies ? "로딩 중..." : `이전 답글 ${remainingReplies}개 더보기`}
                </span>
              </Button>
            )}
            {comment.replies.map((reply) => (
              <ReplyComment key={reply.id} reply={reply} onLike={onLike} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* 원댓글 */}
      <div className="flex gap-0">
        {/* 좌측 컬러바 */}
        <div className={`w-1 rounded-l-xl shrink-0 ${stanceBarClass}`} />

        {/* 댓글 카드 */}
        <div className="flex-1 p-3 rounded-r-xl border border-l-0 border-border bg-card">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {/* 닉네임 첫 글자 배지 */}
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${stanceBgClass}`}>
              {comment.user.nickname.charAt(0)}
            </span>
            <Link href={`/users/${comment.user.id}`} className="font-semibold text-[13px] hover:underline">
              {comment.user.nickname}
            </Link>
            <span className="text-[11px] text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {latestVote && <VoteHistoryBadge status={latestVote} />}
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-muted-foreground text-[11px]">(수정됨)</span>
            )}
            <FollowButton userId={comment.user.id} />
          </div>

          {/* 댓글 내용 */}
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words mb-2">
            {comment.content}
          </p>

          {/* 댓글 이미지 */}
          {comment.images && comment.images.length > 0 && (
            <ImageGallery
              images={comment.images}
              variant="compact"
              className="mb-2"
            />
          )}

          {/* 액션 버튼 */}
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              onClick={handleLikeClick}
            >
              <Heart
                size={14}
                className={comment.isLiked ? "fill-current text-red-500" : ""}
              />
              <span className="text-[12px]">{comment.likeCount > 0 ? comment.likeCount : "좋아요"}</span>
            </button>

            <button
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              onClick={handleReplyClick}
            >
              <Reply size={14} />
              <span className="text-[12px]">답글</span>
            </button>

            {hasReplies && (
              <button
                className="flex items-center gap-1 text-primary transition-colors"
                onClick={toggleReplies}
              >
                <span className="text-[12px] font-medium">
                  {expandedRepliesLabel(showReplies, comment.totalReplies)}
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${showReplies ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 대댓글 목록 */}
      {hasReplies && showReplies && (
        <div className="ml-5 mt-1.5 space-y-1.5">
          {additionalReplies.map((reply) => (
            <ReplyComment key={reply.id} reply={reply} onLike={onLike} />
          ))}
          {hasMoreReplies && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-muted-foreground hover:text-foreground"
              onClick={handleLoadMoreReplies}
              disabled={isLoadingMoreReplies}
            >
              <ChevronDown size={16} className="mr-1" />
              <span className="text-xs">
                {isLoadingMoreReplies ? "로딩 중..." : `이전 답글 ${remainingReplies}개 더보기`}
              </span>
            </Button>
          )}
          {comment.replies.map((reply) => (
            <ReplyComment key={reply.id} reply={reply} onLike={onLike} />
          ))}
        </div>
      )}

      {/* 답글 작성 폼 */}
      {showReplyForm && (
        <div className="mt-3 ml-5">
          <CommentForm
            topicId={topicId}
            parentId={comment.id}
            onSubmit={() => setShowReplyForm(false)}
          />
        </div>
      )}
    </div>
  );
}

const expandedRepliesLabel = (showReplies: boolean, totalReplies: number) => {
  return showReplies ? "답글 접기" : `답글 ${totalReplies}개`;
};
