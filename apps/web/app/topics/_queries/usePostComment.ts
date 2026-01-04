import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/httpClient";
import { CommentResponse } from "@chanban/shared-types";

interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

/**
 * 댓글 작성 mutation 훅
 *
 * @returns UseMutationResult<CommentResponse, Error, CreateCommentDto>
 *
 * @example
 * const { mutate, isPending } = usePostComment();
 *
 * mutate({
 *   content: "댓글 내용",
 *   postId: "post-uuid",
 *   parentId: "parent-comment-uuid" // 대댓글인 경우
 * });
 */
export function usePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (createCommentDto: CreateCommentDto) => {
      return await httpClient.post<CommentResponse, CreateCommentDto>(
        "/api/comments",
        createCommentDto
      );
    },
    onSuccess: (_, variables) => {
      // 댓글 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });

      // 대댓글인 경우 부모 댓글의 답글 목록도 무효화
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["replies", variables.parentId],
        });
      }
    },
  });
}
