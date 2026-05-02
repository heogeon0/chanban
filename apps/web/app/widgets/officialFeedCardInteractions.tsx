"use client";

import { usePostVote } from "@/app/topics/[id]/features/use-post-vote";
import { useTopCommentLike } from "@/app/topics/features/use-top-comment-like";
import { useAuth } from "@/shared/contexts/auth-context";
import { commentQueries } from "@/shared/queries/comment";
import { queryKeys } from "@/shared/queries/keys";
import { postQueries } from "@/shared/queries/post";
import { voteQueries } from "@/shared/queries/vote";
import { PostResponse, VoteStatus } from "@chanban/shared-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { MouseEvent } from "react";

interface OfficialFeedCardInteractionsProps {
  post: PostResponse;
}

/**
 * 메인 피드 카드의 동적 영역(client island).
 * RSC 카드(헤더/제목/본문)와 분리되어 stats / myVote / topComments를 각각 fresh fetch한다.
 * 카운트는 모두 postQueries.stats 응답 기준 — 투표 시 낙관 업데이트로 즉시 반영.
 */
export function OfficialFeedCardInteractions({
  post,
}: OfficialFeedCardInteractionsProps) {
  const { isAuthenticated, openLoginModal } = useAuth();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    ...postQueries.stats(post.id),
    initialData: {
      agreeCount: post.agreeCount,
      disagreeCount: post.disagreeCount,
      neutralCount: post.neutralCount,
      commentCount: post.commentCount,
      viewCount: post.viewCount,
    },
  });

  const { data: myVote } = useQuery({
    ...voteQueries.my(post.id),
    enabled: isAuthenticated,
  });

  const { data: topComments = [] } = useQuery(commentQueries.top(post.id, 5));

  const voteMutation = usePostVote();
  const likeMutation = useTopCommentLike(post.id, 5);

  const total = stats.agreeCount + stats.disagreeCount;
  const agreePercent =
    total === 0 ? 50 : Math.round((stats.agreeCount / total) * 100);
  const disagreePercent = total === 0 ? 50 : 100 - agreePercent;

  const myStatus = myVote?.currentStatus ?? null;
  const isAgreeSelected = myStatus === VoteStatus.AGREE;
  const isDisagreeSelected = myStatus === VoteStatus.DISAGREE;

  const handleVote = (e: MouseEvent, status: VoteStatus) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    voteMutation.mutate(
      { postId: post.id, status },
      {
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.topic.officialInfinite(),
          });
        },
      },
    );
  };

  const handleCommentLike = (
    e: MouseEvent,
    commentId: string,
    isLiked: boolean,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (likeMutation.isPending) return;

    likeMutation.mutate({ commentId, postId: post.id, isLiked });
  };

  return (
    <div className="shrink-0 px-4 pt-3 pb-4 flex flex-col gap-3 border-t border-border bg-card">
      {/* 투표 영역 — Link 네비게이션을 차단해 버튼 클릭만 처리되도록 한다 */}
      <div
        className="flex flex-col gap-3"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* 찬반 분포 바 */}
        <div className="flex gap-[3px] rounded-lg overflow-hidden">
          <div
            className="h-8 bg-opinion-agree flex items-center rounded-l-lg"
            style={{
              flex: agreePercent,
              paddingLeft: agreePercent >= 15 ? "10px" : "2px",
            }}
          >
            {agreePercent >= 15 && (
              <span className="text-[12px] font-bold text-white">
                찬성 {agreePercent}%
              </span>
            )}
          </div>
          <div
            className="h-8 bg-opinion-disagree flex items-center justify-end rounded-r-lg"
            style={{
              flex: disagreePercent,
              paddingRight: disagreePercent >= 15 ? "10px" : "2px",
            }}
          >
            {disagreePercent >= 15 && (
              <span className="text-[12px] font-bold text-white">
                반대 {disagreePercent}%
              </span>
            )}
          </div>
        </div>

        {/* 찬성/반대 버튼 */}
        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={voteMutation.isPending}
            onClick={(e) => handleVote(e, VoteStatus.AGREE)}
            className={`flex-1 h-16 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-60 ${
              isAgreeSelected
                ? "bg-opinion-agree text-white shadow-md shadow-opinion-agree/30"
                : "bg-opinion-agree/15 text-opinion-agree hover:bg-opinion-agree/25"
            }`}
          >
            <span className="text-[15px] font-extrabold">찬성</span>
          </button>
          <button
            type="button"
            disabled={voteMutation.isPending}
            onClick={(e) => handleVote(e, VoteStatus.DISAGREE)}
            className={`flex-1 h-16 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-60 ${
              isDisagreeSelected
                ? "bg-opinion-disagree text-white shadow-md shadow-opinion-disagree/30"
                : "bg-opinion-disagree/15 text-opinion-disagree hover:bg-opinion-disagree/25"
            }`}
          >
            <span className="text-[15px] font-extrabold">반대</span>
          </button>
        </div>
      </div>

      {/* 메타 */}
      <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          {stats.commentCount}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {stats.viewCount}
        </span>
      </div>

      {/* 인기 댓글 TOP 5 — 비로그인도 표시. 0건이면 placeholder 노출 */}
      {topComments.length === 0 ? (
        <div className="rounded-xl bg-muted/30 px-4 py-5 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
          <MessageCircle className="w-4 h-4" />
          아직 댓글이 없어요. 첫 댓글을 남겨보세요
        </div>
      ) : (
        <section className="rounded-xl bg-muted/40 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            인기 댓글 TOP {topComments.length}
          </div>
          <ul className="flex flex-col gap-1.5">
            {topComments.map((c) => {
              const stance = c.user.voteHistory.at(-1)?.toStatus;
              const stanceLabel =
                stance === VoteStatus.AGREE
                  ? "찬성"
                  : stance === VoteStatus.DISAGREE
                    ? "반대"
                    : "미투표";
              const dotClass =
                stance === VoteStatus.AGREE
                  ? "bg-opinion-agree"
                  : stance === VoteStatus.DISAGREE
                    ? "bg-opinion-disagree"
                    : "bg-muted-foreground/50";
              return (
                <li key={c.id} className="flex items-start gap-2.5">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotClass}`}
                    aria-label={stanceLabel}
                  />
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-[13px] font-semibold text-foreground">
                      {c.user.nickname}
                    </span>
                    <p className="text-[14px] leading-snug text-foreground/90 line-clamp-2">
                      {c.content}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCommentLike(e, c.id, c.isLiked)}
                    disabled={likeMutation.isPending}
                    aria-label={c.isLiked ? "좋아요 취소" : "좋아요"}
                    className={`mt-0.5 flex items-center gap-0.5 text-[12px] shrink-0 transition-colors disabled:cursor-default ${
                      c.isLiked
                        ? "text-rose-500"
                        : "text-muted-foreground hover:text-rose-500"
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${c.isLiked ? "fill-rose-500" : ""}`}
                    />
                    {c.likeCount}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
