"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { commentQueries, voteQueries } from "@/shared/queries";
import { UserAvatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { CommentSortType, VoteStatus } from "@chanban/shared-types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCommentLike, usePostVote } from "../features";
import { AiSummarySection } from "./aiSummarySection";
import { CommentForm } from "./commentForm";
import { CommentList } from "./commentList";
import { VoteButtons } from "./voteButtons";
import { VoteDistributionBar } from "./voteDistributionBar";

interface TopicDetailContentProps {
  topicId: string;
  commentCount: number;
  initialVoteCount?: {
    agreeCount: number;
    disagreeCount: number;
    neutralCount: number;
  };
}

/**
 * 토픽 상세 페이지의 투표 및 댓글 섹션 컴포넌트
 * 투표 후 댓글 작성 폼을 표시하는 로직을 포함
 *
 * @param topicId - 토픽 ID
 * @param commentCount - 서버에서 받아온 전체 댓글 수
 */
export function TopicDetailContent({ topicId, commentCount, initialVoteCount }: TopicDetailContentProps) {
  const [sortType, setSortType] = useState<CommentSortType>("popular");
  const { isAuthenticated, isLoading: isLoadingAuth, user } = useAuth();

  const { mutate: postVote, isPending: isVotePending } = usePostVote();
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...commentQueries.list(topicId, sortType),
    enabled: !!topicId,
  });

  /** 무한 스크롤 데이터를 평탄화하여 댓글 배열로 변환 */
  const comments = useMemo(() => {
    return commentsData?.pages.flatMap((page) => page.data) ?? [];
  }, [commentsData]);

  const { data: voteCount } = useQuery({
    ...voteQueries.count(topicId),
    initialData: initialVoteCount,
  });
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
    <div className="space-y-0">
      {/* 투표 섹션 */}
      <section className="px-5 py-4">
        {/* 투표 현황 바 */}
        {voteCount && (
          <div className="mb-3">
            <VoteDistributionBar
              agreeCount={voteCount.agreeCount}
              disagreeCount={voteCount.disagreeCount}
              neutralCount={voteCount.neutralCount}
              hasVoted={!!myVote?.currentStatus}
            />
          </div>
        )}

        {/* 투표 버튼 */}
        <VoteButtons
          onVote={handleVote}
          selectedStatus={myVote?.currentStatus ?? null}
          disabled={isVotePending}
        />
      </section>

      {/* 섹션 구분선 */}
      <div className="h-2 bg-muted" />

      {/* AI 요약 섹션 */}
      <div className="px-5 py-4">
        <AiSummarySection topicId={topicId} />
      </div>

      {/* 섹션 구분선 */}
      <div className="h-2 bg-muted" />

      {/* 댓글 섹션 */}
      <section className="space-y-4 px-5 py-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            <h2 className="text-[15px] font-bold">토론</h2>
            <span className="text-[14px] font-semibold text-primary">{commentCount}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
            <button
              type="button"
              onClick={() => setSortType("popular")}
              className={`px-2 py-0.5 text-xs font-medium rounded-full transition-all ${
                sortType === "popular"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              인기
            </button>
            <button
              type="button"
              onClick={() => setSortType("latest")}
              className={`px-2 py-0.5 text-xs font-medium rounded-full transition-all ${
                sortType === "latest"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              최신
            </button>
          </div>
        </div>

        {/* 댓글 작성 폼 (로그인 시에만 표시) */}
        {isAuthenticated && (
          <div className="flex gap-4">
            <UserAvatar user={user} size="md" />
            <div className="flex-1">
              <CommentForm
                topicId={topicId}
                />
            </div>
          </div>
        )}

        {/* 댓글 목록 */}
        {isLoadingAuth ? (
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
                </div>
              </div>
            ))}
          </div>
        ) : isAuthenticated ? (
          <CommentList
            comments={comments}
            topicId={topicId}
            onLike={handleLike}
            isLoading={isLoadingComments}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
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
                  <Link href={`/auth/login?returnUrl=/topics/${topicId}`}>로그인</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
