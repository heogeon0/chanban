import { httpClient } from "@/lib/httpClient";
import { CommentResponse, PaginatedResponse } from "@chanban/shared-types";
import { useQuery } from "@tanstack/react-query";

/**
 * 댓글 목록 조회 query 훅
 * 특정 게시글의 댓글 목록을 가져옵니다.
 *
 * @param postId - 게시글 ID
 * @returns UseQueryResult<CommentResponse[], Error>
 *
 * @example
 * const { data: comments, isLoading } = useGetComments(topicId);
 */
export function useGetComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      return await httpClient.get<PaginatedResponse<CommentResponse[]>>(`/api/comments/posts/${postId}`).then(response => response.data);
    },
    enabled: !!postId,
  });
}
