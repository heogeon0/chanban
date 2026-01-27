"use client";

import { CommentReplyResponse, CommentResponse } from "@chanban/shared-types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ChevronDown, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetReplies } from "@/shared/queries";
import { VoteHistoryBadge, formatRelativeTime } from "./commentUtils";
import { ReplyComment } from "./replyComment";
import { CommentForm } from "./commentForm";

interface CommentProps {
  comment: CommentResponse;
  topicId: string;
  onLike?: (commentId: string, isLiked: boolean) => void;
}

/**
 * 댓글 컴포넌트
 * CommentResponse 데이터를 받아 원댓글 UI를 렌더링합니다.
 * 답글 목록, 답글 더보기, 좋아요, 답글 작성 기능을 제공합니다.
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
  const latestVote = comment.user.voteHistory[0]?.toStatus;

  // 답글 더보기를 위한 쿼리
  const { data: moreReplies, isLoading: isLoadingMoreReplies } = useGetReplies({
    commentId: comment.id,
    page: currentPage,
    enabled: loadMoreEnabled,
  });

  // 추가 답글 로드 완료 시 상태 업데이트 (중복 제거)
  useEffect(() => {
    if (moreReplies && moreReplies.length > 0) {
      setAdditionalReplies((prev) => {
        // 기존에 표시된 모든 답글 ID 수집
        const existingIds = new Set([
          ...prev.map((r) => r.id),
          ...comment.replies.map((r) => r.id),
        ]);

        // 중복되지 않은 새로운 답글만 필터링
        const newReplies = moreReplies.filter((r) => !existingIds.has(r.id));

        return [...prev, ...newReplies];
      });
      setLoadMoreEnabled(false);
    }
  }, [moreReplies, comment.replies]);

  const INITIAL_REPLY_LIMIT = 3;
  const currentReplyCount = comment.replies.length + additionalReplies.length;
  const hasMoreReplies = comment.totalReplies > currentReplyCount;
  const remainingReplies = comment.totalReplies - currentReplyCount;

  /**
   * 답글 버튼 클릭 핸들러
   * 답글 작성 폼을 토글하고, 답글 목록을 펼칩니다.
   */
  const handleReplyClick = () => {
    setShowReplyForm((prev) => !prev);
    // 답글 폼을 열 때 답글 목록도 자동으로 펼침
    if (!showReplyForm) {
      setShowReplies(true);
    }
  };

  /**
   * 좋아요 버튼 클릭 핸들러
   */
  const handleLikeClick = () => {
    onLike?.(comment.id, comment.isLiked);
  };

  /**
   * 대댓글 토글 핸들러
   */
  const toggleReplies = () => {
    setShowReplies((prev) => !prev);
  };

  /**
   * 이전 답글 더보기 핸들러
   * 다음 페이지의 답글 10개를 추가로 로드합니다.
   */
  const handleLoadMoreReplies = () => {
    setCurrentPage((prev) => prev + 1);
    setLoadMoreEnabled(true);
  };

  // 삭제된 댓글 표시
  if (isDeleted) {
    return (
      <div>
        <div className="bg-muted/50 border border-dashed rounded-lg p-4">
          <p className="text-muted-foreground text-body-default">
            삭제된 댓글입니다.
          </p>
        </div>

        {/* 대댓글은 삭제된 댓글에도 표시 */}
        {hasReplies && showReplies && (
          <div className="mt-3 space-y-3">
            {/* 추가로 로드된 답글 */}
            {additionalReplies.map((reply) => (
              <ReplyComment
                key={reply.id}
                reply={reply}
                onLike={onLike}
              />
            ))}

            {/* 이전 답글 더보기 버튼 */}
            {hasMoreReplies && (
              <div className="ml-12">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-muted-foreground hover:text-foreground"
                  onClick={handleLoadMoreReplies}
                  disabled={isLoadingMoreReplies}
                >
                  <ChevronDown size={16} className="mr-1" />
                  <span className="text-caption-default">
                    {isLoadingMoreReplies
                      ? "로딩 중..."
                      : `이전 답글 ${remainingReplies}개 더보기`}
                  </span>
                </Button>
              </div>
            )}

            {/* 초기 답글 */}
            {comment.replies.map((reply) => (
              <ReplyComment
                key={reply.id}
                reply={reply}
                onLike={onLike}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* 원댓글 */}
      <div className="flex gap-4">
        {/* 아바타 */}
        <Avatar className="flex-shrink-0 w-10 h-10">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {comment.user.nickname.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          {/* 댓글 카드 */}
          <div className="bg-muted/50 rounded-xl p-4">
            {/* 헤더: 사용자 정보 및 메타데이터 */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-bold text-sm">{comment.user.nickname}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(comment.createdAt)}
              </span>

              {/* 투표 히스토리 뱃지 */}
              {latestVote && <VoteHistoryBadge status={latestVote} />}

              {/* 수정된 댓글 표시 */}
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-muted-foreground text-xs">(수정됨)</span>
              )}
            </div>

            {/* 댓글 내용 */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-4 mt-2 px-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
              onClick={handleLikeClick}
            >
              <Heart
                size={18}
                className={comment.isLiked ? "fill-current text-red-500" : ""}
              />
              좋아요
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
              onClick={handleReplyClick}
            >
              <MessageCircle size={18} />
              답글
            </Button>

            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-bold text-muted-foreground hover:text-primary"
                onClick={toggleReplies}
              >
                답글 {comment.totalReplies}개 {showReplies ? "숨기기" : "보기"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 대댓글 목록 */}
      {hasReplies && showReplies && (
        <div className="mt-4 space-y-4 border-l-2 border-border ml-5 pl-4">
          {/* 추가로 로드된 답글 (오래된 답글) */}
          {additionalReplies.map((reply) => (
            <ReplyComment key={reply.id} reply={reply} onLike={onLike} />
          ))}

          {/* 이전 답글 더보기 버튼 */}
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
                {isLoadingMoreReplies
                  ? "로딩 중..."
                  : `이전 답글 ${remainingReplies}개 더보기`}
              </span>
            </Button>
          )}

          {/* 초기 답글 (최신 3개) */}
          {comment.replies.map((reply) => (
            <ReplyComment key={reply.id} reply={reply} onLike={onLike} />
          ))}
        </div>
      )}

      {/* 답글 작성 폼 */}
      {showReplyForm && (
        <div className="mt-4 ml-14">
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
