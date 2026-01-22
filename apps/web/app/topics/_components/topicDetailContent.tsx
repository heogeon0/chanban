"use client";

import { VoteStatus } from "@chanban/shared-types";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { useCommentLike } from "../_queries/useCommentLike";
import { useGetComments } from "../_queries/useGetComments";
import { useGetVoteCount } from "../_queries/useGetVoteCount";
import { usePostVote } from "../_queries/usePostVote";
import { CommentForm } from "./commentForm";
import { CommentList } from "./commentList";
import { VoteButtons } from "./voteButtons";
import { VoteDistributionBar } from "./voteDistributionBar";

interface TopicDetailContentProps {
  topicId: string;
}

/**
 * 토픽 상세 페이지의 투표 및 댓글 섹션 컴포넌트
 * 투표 후 댓글 작성 폼을 표시하는 로직을 포함
 *
 * @param topicId - 토픽 ID
 */
export function TopicDetailContent({ topicId }: TopicDetailContentProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);

  const { mutate: postVote, isPending } = usePostVote();
  const { data: comments = [], isLoading: isLoadingComments } =
    useGetComments(topicId);
  const { data: voteCount } = useGetVoteCount(topicId);
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
   * 좋아요 버튼 클릭 핸들러
   * 댓글에 좋아요를 추가하거나 취소합니다.
   */
  const handleLike = (commentId: string, isLiked: boolean) => {
    likeComment({
      isLiked,
      commentId,
      postId: topicId,
    });
  };

  return (
    <div className="space-y-12">
      {/* 투표 섹션 */}
      <section className="bg-card border border-border rounded-xl p-6 desktop:p-8 shadow-sm">
        <h3 className="text-center font-bold text-xl mb-8 uppercase tracking-widest">
          투표하기
        </h3>

        {/* 투표 버튼 */}
        <div className="mb-10">
          <VoteButtons
            postId={topicId}
            onVote={handleVote}
            isPending={isPending}
            onShowCommentForm={() => setShowCommentForm(true)}
          />
        </div>

        {/* 투표 현황 */}
        {voteCount && (
          <VoteDistributionBar
            agreeCount={voteCount.agreeCount}
            disagreeCount={voteCount.disagreeCount}
            neutralCount={voteCount.neutralCount}
          />
        )}
      </section>

      {/* 댓글 섹션 */}
      <section className="space-y-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            토론 ({comments.length})
          </h2>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <button className="px-3 py-1 text-xs font-bold bg-card rounded shadow-sm">
              인기
            </button>
            <button className="px-3 py-1 text-xs font-bold text-muted-foreground">
              최신
            </button>
          </div>
        </div>

        {/* 댓글 작성 폼 */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
          <div className="flex-1">
            <CommentForm
              topicId={topicId}
              onSubmit={() => setShowCommentForm(false)}
            />
          </div>
        </div>

        {/* 댓글 목록 */}
        <CommentList
          comments={comments}
          topicId={topicId}
          onLike={handleLike}
          isLoading={isLoadingComments}
        />
      </section>
    </div>
  );
}
