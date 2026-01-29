import { queryKeys, commentMutations } from "@/shared/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 댓글 작성 mutation 훅
 * 댓글 작성 후 관련 쿼리들을 자동으로 invalidate 합니다.
 */
export function usePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commentMutations.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comment.list(variables.postId),
      });

      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["replies", variables.parentId],
        });
      }
    },
  });
}
