import { CommentLikeDto, commentMutations } from "@/shared/queries";
import { commentQueries } from "@/shared/queries/comment";
import { CommentResponse } from "@chanban/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface OptimisticContext {
  previous: CommentResponse[] | undefined;
}

/**
 * 피드 카드의 TOP 인기 댓글 전용 좋아요 mutation.
 * 피드 미리보기에서는 추가만 지원 (취소는 상세에서). TOP 쿼리 캐시를 낙관적으로 +1 한다.
 * 중복 방지는 호출부에서 로컬 state로 처리.
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
        queryClient.setQueryData<CommentResponse[]>(
          queryKey,
          previous.map((c) =>
            c.id === variables.commentId
              ? { ...c, likeCount: c.likeCount + 1, isLiked: true }
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
