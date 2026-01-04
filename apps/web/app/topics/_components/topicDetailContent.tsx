"use client";

import { VoteStatus } from "@chanban/shared-types";
import { useState } from "react";
import { usePostVote } from "../_queries/usePostVote";
import { CommentForm } from "./commentForm";
import { VoteButtons } from "./voteButtons";

interface TopicDetailContentProps {
  topicId: string;
  commentCount: number;
}

/**
 * 토픽 상세 페이지의 투표 및 댓글 섹션 컴포넌트
 * 투표 후 댓글 작성 폼을 표시하는 로직을 포함
 *
 * @param topicId - 토픽 ID
 * @param commentCount - 댓글 개수
 */
export function TopicDetailContent({
  topicId,
  commentCount,
}: TopicDetailContentProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { mutate: postVote, isPending } = usePostVote();

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
            댓글 {commentCount}개
          </h2>
        </div>

        {/* 투표 후 댓글 작성 폼 표시 */}
        {showCommentForm && <CommentForm topicId={topicId} />}

        {/* TODO: 댓글 목록은 별도 컴포넌트나 API로 구현 필요 */}
        {commentCount === 0 ? (
          <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
            아직 댓글이 없습니다.
            {!showCommentForm && " 투표 후 첫 댓글을 작성해보세요!"}
          </div>
        ) : (
          <div className="bg-card border rounded-lg p-4 text-center text-muted-foreground">
            댓글 {commentCount}개
          </div>
        )}
      </section>
    </div>
  );
}
