import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/httpClient";

interface CommentLikeDto {
  commentId: string;
  postId: string;
}

/**
 * 댓글 좋아요 mutation 훅
 * 댓글에 좋아요를 추가하거나 취소합니다.
 *
 * @returns UseMutationResult<void, Error, CommentLikeDto>
 *
 * @example
 * const { mutate: likeComment } = useCommentLike();
 *
 * likeComment({
 *   commentId: "comment-uuid",
 *   postId: "post-uuid"
 * });
 */
export function useCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId }: CommentLikeDto) => {
      return await httpClient.post<void>(`/api/comments/${commentId}/like`);
    },
    onSuccess: (_, variables) => {
      // 댓글 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
    },
  });
}
