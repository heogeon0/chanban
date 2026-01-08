"use client";

import { VoteStatus } from "@chanban/shared-types";
import { useState } from "react";
import { useCommentLike } from "../_queries/useCommentLike";
import { useGetComments } from "../_queries/useGetComments";
import { usePostVote } from "../_queries/usePostVote";
import { CommentForm } from "./commentForm";
import { CommentList } from "./commentList";
import { VoteButtons } from "./voteButtons";

interface TopicDetailContentProps {
  topicId: string;
}

/**
 * 토픽 상세 페이지의 투표 및 댓글 섹션 컴포넌트
 * 투표 후 댓글 작성 폼을 표시하는 로직을 포함
 *
 * @param topicId - 토픽 ID
 */
export function TopicDetailContent({
  topicId,
}: TopicDetailContentProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);

  const { mutate: postVote, isPending } = usePostVote();
  const { data: comments = [], isLoading: isLoadingComments } = useGetComments(topicId);
  const { mutate: likeComment } = useCommentLike();

  /**
   * 투표 핸들러
   * 투표 성공 시 댓글 작성 폼을 표시합니다.
   */
  const handleVote = (status: VoteStatus) => {
    postVote(
      {
        postId: topicId,
        status,
      },
      {
        onSuccess: () => {
          setShowCommentForm(true);
        },
      }
    );
  };

  /**
   * 답글 버튼 클릭 핸들러
   * 해당 댓글에 대한 답글 작성 폼을 표시합니다.
   */
  const handleReply = (commentId: string) => {
    setReplyToCommentId(commentId);
  };

  /**
   * 좋아요 버튼 클릭 핸들러
   * 댓글에 좋아요를 추가하거나 취소합니다.
   */
  const handleLike = (commentId: string) => {
    likeComment({
      commentId,
      postId: topicId,
    });
  };

  return (
    <div className="space-y-3">
      {/* 투표 버튼 섹션 */}
      <section className="bg-card border rounded-lg p-4">
        <h3 className="text-title-default font-semibold mb-4 text-center">
          어떻게 생각하시나요?
        </h3>
        <VoteButtons
          postId={topicId}
          onVote={handleVote}
          isPending={isPending}
          onShowCommentForm={() => setShowCommentForm(true)}
        />
      </section>

      {/* 댓글 섹션 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-title-default font-semibold">
            댓글 {comments.length}개
          </h2>
        </div>

        {/* 투표 후 댓글 작성 폼 표시 */}
        {showCommentForm && (
          <CommentForm
            topicId={topicId}
            onSubmit={() => setShowCommentForm(false)}
          />
        )}

        {/* 답글 작성 폼 */}
        {replyToCommentId && (
          <div className="ml-12">
            <CommentForm
              topicId={topicId}
              parentId={replyToCommentId}
              onSubmit={() => setReplyToCommentId(null)}
            />
          </div>
        )}

        {/* 댓글 목록 */}
        <CommentList
          comments={comments}
          onReply={handleReply}
          onLike={handleLike}
          isLoading={isLoadingComments}
        />
      </section>
    </div>
  );
}
