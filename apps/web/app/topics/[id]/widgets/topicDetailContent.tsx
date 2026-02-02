"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { commentQueries, voteQueries } from "@/shared/queries";
import { Button } from "@/shared/ui/button";
import { CommentSortType, VoteStatus } from "@chanban/shared-types";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCommentLike, usePostVote } from "../features";
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
  const [sortType, setSortType] = useState<CommentSortType>("popular");
  const { isAuthenticated } = useAuth();

  const { mutate: postVote } = usePostVote();
  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    ...commentQueries.list(topicId, sortType),
    enabled: !!topicId,
  });
  const { data: voteCount } = useQuery(voteQueries.count(topicId));
  const { data: myVote } = useQuery(voteQueries.my(topicId));
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
            onShowCommentForm={() => setShowCommentForm(true)}
            selectedStatus={myVote?.currentStatus ?? null}
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
            <button
              type="button"
              onClick={() => setSortType("popular")}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                sortType === "popular"
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              인기
            </button>
            <button
              type="button"
              onClick={() => setSortType("latest")}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                sortType === "latest"
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
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
        {isAuthenticated ? (
          <CommentList
            comments={comments}
            topicId={topicId}
            onLike={handleLike}
            isLoading={isLoadingComments}
          />
        ) : (
          <div className="relative">
            {/* 블러 처리된 스켈레톤 UI */}
            <div className="blur-sm pointer-events-none select-none">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                          <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                        </div>
                        <div className="h-4 bg-muted rounded w-full animate-pulse" />
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      </div>
                      <div className="flex gap-4 px-2">
                        <div className="h-6 bg-muted rounded w-16 animate-pulse" />
                        <div className="h-6 bg-muted rounded w-12 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 로그인 유도 오버레이 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 p-8 bg-card border border-border rounded-2xl shadow-lg">
                <p className="text-lg font-medium text-foreground">
                  로그인해서 다른 사람들의 의견을 확인해보세요
                </p>
                <Button asChild size="lg">
                  <Link href="/auth/login">로그인</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
