import { queryKeys, commentMutations } from "@/shared/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 댓글 좋아요 mutation 훅
 * 댓글에 좋아요를 추가하거나 취소합니다.
 */
export function useCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentMutations.toggleLike,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comment.list(variables.postId),
      });
    },
  });
}
