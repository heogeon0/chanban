"use client";

import { BanIcon, ChanIcon, ChongIcon } from "@/shared/ui/icons";
import { CommentResponse, VoteStatus } from "@chanban/shared-types";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";

interface CommentProps {
  comment: CommentResponse;
  onReply?: (commentId: string) => void;
  onLike?: (commentId: string, isLiked: boolean) => void;
}

/**
 * 투표 상태에 따른 뱃지 컴포넌트
 * 사용자의 투표 히스토리를 시각적으로 표시합니다.
 *
 * @param status - 투표 상태 (찬성/중립/반대)
 */
function VoteHistoryBadge({ status }: { status: VoteStatus }) {
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
function formatRelativeTime(date: Date): string {
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

/**
 * 개별 댓글 아이템 컴포넌트
 * 댓글 내용, 사용자 정보, 투표 히스토리, 액션 버튼을 표시합니다.
 *
 * @param comment - 댓글 데이터
 * @param onReply - 답글 버튼 클릭 시 호출될 콜백
 * @param onLike - 좋아요 버튼 클릭 시 호출될 콜백
 * @param isReply - 대댓글 여부 (들여쓰기 스타일 적용)
 */
function CommentItem({
  comment,
  onReply,
  onLike,
  isReply = false,
}: CommentProps & { isReply?: boolean }) {
  const [showReplies, setShowReplies] = useState(true);

  const isDeleted = comment.deletedAt !== null;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const latestVote = comment.user.voteHistory[0]?.toStatus;

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

  // 삭제된 댓글 표시
  if (isDeleted) {
    return (
      <div className={`${isReply ? "ml-12" : ""}`}>
        <div className="bg-muted/50 border border-dashed rounded-lg p-4">
          <p className="text-muted-foreground text-body-default">
            삭제된 댓글입니다.
          </p>
        </div>

        {/* 대댓글은 삭제된 댓글에도 표시 */}
        {hasReplies && showReplies && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply as CommentResponse}
                onReply={onReply}
                onLike={onLike}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${isReply ? "ml-12" : ""}`}>
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

          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 gap-1.5"
              onClick={handleReplyClick}
            >
              <MessageCircle size={16} />
              <span className="text-caption-default">답글</span>
            </Button>
          )}

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
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply as CommentResponse}
              onReply={onReply}
              onLike={onLike}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 댓글 컴포넌트
 * CommentResponse 데이터를 받아 댓글 UI를 렌더링합니다.
 *
 * @param comment - 댓글 데이터
 * @param onReply - 답글 버튼 클릭 시 호출될 콜백 함수
 * @param onLike - 좋아요 버튼 클릭 시 호출될 콜백 함수
 * 
 */
export function Comment({ comment, onReply, onLike }: CommentProps) {
  return <CommentItem comment={comment} onReply={onReply} onLike={onLike} />;
}
