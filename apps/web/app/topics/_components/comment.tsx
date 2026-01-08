"use client";

import { CommentReplyResponse, CommentResponse } from "@chanban/shared-types";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { ChevronDown, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetReplies } from "../_queries/useGetReplies";
import { VoteHistoryBadge, formatRelativeTime } from "./commentUtils";
import { ReplyComment } from "./replyComment";

interface CommentProps {
  comment: CommentResponse;
  onReply?: (commentId: string) => void;
  onLike?: (commentId: string, isLiked: boolean) => void;
}

/**
 * 댓글 컴포넌트
 * CommentResponse 데이터를 받아 원댓글 UI를 렌더링합니다.
 * 답글 목록, 답글 더보기, 좋아요, 답글 작성 기능을 제공합니다.
 *
 * @param comment - 댓글 데이터
 * @param onReply - 답글 버튼 클릭 시 호출될 콜백 함수
 * @param onLike - 좋아요 버튼 클릭 시 호출될 콜백 함수
 */
export function Comment({ comment, onReply, onLike }: CommentProps) {
  const [showReplies, setShowReplies] = useState(true);
  const [additionalReplies, setAdditionalReplies] = useState<CommentReplyResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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

  // 추가 답글 로드 완료 시 상태 업데이트
  useEffect(() => {
    if (moreReplies && moreReplies.length > 0) {
      setAdditionalReplies((prev) => [...prev, ...moreReplies]);
      setLoadMoreEnabled(false);
    }
  }, [moreReplies]);

  const INITIAL_REPLY_LIMIT = 3;
  const currentReplyCount = comment.replies.length + additionalReplies.length;
  const hasMoreReplies = comment.totalReplies > currentReplyCount;
  const remainingReplies = comment.totalReplies - currentReplyCount;

  /**
   * 답글 버튼 클릭 핸들러
   */
  const handleReplyClick = () => {
    onReply?.(comment.id);
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
      <div className="bg-card border rounded-lg p-4">
        {/* 헤더: 사용자 정보 및 메타데이터 */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="flex-shrink-0">
            <AvatarFallback>
              {comment.user.nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-body-default">
                {comment.user.nickname}
              </span>

              {/* 투표 히스토리 뱃지 */}
              {latestVote && <VoteHistoryBadge status={latestVote} />}

              <span className="text-muted-foreground text-caption-default">
                {formatRelativeTime(comment.createdAt)}
              </span>

              {/* 수정된 댓글 표시 */}
              {comment.updatedAt !== comment.createdAt && (
                <span className="text-muted-foreground text-caption-default">
                  (수정됨)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 댓글 내용 */}
        <div className="mb-3 ml-12">
          <p className="text-body-default whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 ml-12">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1.5"
            onClick={handleLikeClick}
          >
            <Heart
              size={16}
              className={comment.isLiked ? "fill-current text-red-500" : ""}
            />
            <span className="text-caption-default">좋아요</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 gap-1.5"
            onClick={handleReplyClick}
          >
            <MessageCircle size={16} />
            <span className="text-caption-default">답글</span>
          </Button>

          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={toggleReplies}
            >
              <span className="text-caption-default">
                답글 {comment.totalReplies}개 {showReplies ? "숨기기" : "보기"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* 대댓글 목록 */}
      {hasReplies && showReplies && (
        <div className="mt-3 space-y-3">
          {/* 추가로 로드된 답글 (오래된 답글) */}
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

          {/* 초기 답글 (최신 3개) */}
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
