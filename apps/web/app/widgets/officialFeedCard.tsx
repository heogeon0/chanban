"use client";

import { usePostVote } from "@/app/topics/[id]/features/use-post-vote";
import { useTopCommentLike } from "@/app/topics/features/use-top-comment-like";
import { useAuth } from "@/shared/contexts/auth-context";
import { commentQueries } from "@/shared/queries/comment";
import { queryKeys } from "@/shared/queries/keys";
import { voteQueries } from "@/shared/queries/vote";
import { PostResponse, VoteStatus } from "@chanban/shared-types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Heart, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { MouseEvent } from "react";

interface OfficialFeedCardProps {
  post: PostResponse;
}

const TAG_LABEL: Record<string, string> = {
  politics: "정치",
  society: "사회",
  economy: "경제",
  technology: "기술",
  entertainment: "연예",
  sports: "스포츠",
  other: "기타",
};

/**
 * 공식 투표 피드 카드.
 * 레이아웃: 헤더 + 제목 + 본문(긴 글은 하단 페이드) + 찬반 바 + 찬/반 버튼 + 인기 댓글 TOP 5.
 * 카드 높이는 콘텐츠에 따라 가변. 긴 본문은 clamp + gradient로 "더 보기" 유도.
 */
const LONG_CONTENT_THRESHOLD = 300;
export function OfficialFeedCard({ post }: OfficialFeedCardProps) {
  const { isAuthenticated, openLoginModal } = useAuth();
  const queryClient = useQueryClient();

  const { data: myVote } = useQuery({
    ...voteQueries.my(post.id),
    enabled: isAuthenticated,
  });

  // 리스트 응답의 count는 스냅샷일 뿐 — 낙관적 업데이트가 흐르는 vote.count 캐시를
  // 우선 구독해야 투표 직후 찬반바 비율이 즉시 반영된다.
  const { data: voteCount } = useQuery({
    ...voteQueries.count(post.id),
    initialData: {
      agreeCount: post.agreeCount,
      disagreeCount: post.disagreeCount,
      neutralCount: post.neutralCount,
    },
    staleTime: 30_000,
  });

  const { data: topComments = [] } = useQuery(commentQueries.top(post.id, 5));

  const voteMutation = usePostVote();
  const likeMutation = useTopCommentLike(post.id, 5);

  const handleCommentLike = (e: MouseEvent, commentId: string, isLiked: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (likeMutation.isPending) return;

    likeMutation.mutate({ commentId, postId: post.id, isLiked });
  };

  const total = voteCount.agreeCount + voteCount.disagreeCount;
  const agreePercent = total === 0 ? 50 : Math.round((voteCount.agreeCount / total) * 100);
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

  const isLongContent = !!post.content && post.content.length > LONG_CONTENT_THRESHOLD;

  return (
    <Link href={`/topics/${post.id}`} className="block">
      <article className="flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* 헤더 */}
        <header className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary text-primary-foreground">
            <ShieldCheck className="w-3 h-3" />
            공식
          </span>
          <span className="text-[13px] font-semibold text-foreground">
            {post.creator.nickname}
          </span>
          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
            {TAG_LABEL[post.tag] ?? post.tag}
          </span>
        </header>

        {/* 제목 */}
        <h2 className="text-lg font-bold leading-tight px-4 pb-3 shrink-0">
          {post.title}
        </h2>

        {/* 본문 — 짧은 글은 자연 높이, 긴 글은 14줄 clamp + 하단 페이드로 "더 보기" 유도 */}
        <div className="relative px-4 pt-3 pb-3 border-t border-border/60">
          {post.content ? (
            <>
              <p
                className={`text-[14px] leading-relaxed text-foreground/85 whitespace-pre-wrap ${
                  isLongContent ? "line-clamp-[14]" : ""
                }`}
              >
                {post.content}
              </p>
              {isLongContent && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 bottom-8 h-16 bg-gradient-to-t from-card to-transparent" />
                  <div className="relative mt-2 text-right text-[12px] font-semibold text-primary">
                    본문 더 보기 →
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">본문이 없습니다.</p>
          )}
        </div>

        {/* 하단 고정 영역: 투표바 + 버튼 + 메타 + 인기 댓글 */}
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
              {post.commentCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {post.viewCount}
            </span>
          </div>

          {/* 인기 댓글 TOP 5 — 비로그인도 표시 */}
          {topComments.length > 0 && (
            <section className="rounded-xl bg-muted/40 p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[13px] font-bold text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                인기 댓글 TOP {topComments.length}
              </div>
              <ul className="flex flex-col gap-2.5">
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
      </article>
    </Link>
  );
}
