import { CommentLikeDto, commentMutations } from "@/shared/queries";
import { commentQueries } from "@/shared/queries/comment";
import { CommentResponse } from "@chanban/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface OptimisticContext {
  previous: CommentResponse[] | undefined;
}

/**
 * 피드 카드의 TOP 인기 댓글 전용 좋아요 mutation.
 * 토글 양방향 지원 — 변수의 `isLiked`(현재 상태)를 받아 반전된 상태로 캐시를 낙관 업데이트.
 */
export function useTopCommentLike(postId: string, limit = 5) {
  const queryClient = useQueryClient();
  const queryKey = commentQueries.top(postId, limit).queryKey;

  return useMutation({
    mutationFn: commentMutations.toggleLike,
    onMutate: async (variables: CommentLikeDto): Promise<OptimisticContext> => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CommentResponse[]>(queryKey);
      if (previous) {
        const nextIsLiked = !variables.isLiked;
        const delta = nextIsLiked ? 1 : -1;
        queryClient.setQueryData<CommentResponse[]>(
          queryKey,
          previous.map((c) =>
            c.id === variables.commentId
              ? {
                  ...c,
                  isLiked: nextIsLiked,
                  likeCount: Math.max(0, c.likeCount + delta),
                }
              : c,
          ),
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });
}
