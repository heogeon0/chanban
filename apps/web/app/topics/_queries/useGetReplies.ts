import { httpClient } from "@/lib/httpClient";
import { CommentReplyResponse, PaginatedResponse } from "@chanban/shared-types";
import { useQuery } from "@tanstack/react-query";

interface UseGetRepliesParams {
  commentId: string;
  page: number;
  enabled?: boolean;
}

/**
 * 특정 댓글의 답글 목록을 추가로 조회하는 query 훅
 * "답글 더보기" 기능에서 사용됩니다.
 *
 * @param commentId - 부모 댓글 ID
 * @param page - 페이지 번호
 * @param enabled - 쿼리 활성화 여부
 * @returns UseQueryResult<CommentReplyResponse[], Error>
 *
 * @example
 * const { data: replies, isLoading } = useGetReplies({
 *   commentId: "comment-uuid",
 *   page: 2,
 *   enabled: showMoreReplies
 * });
 */
export function useGetReplies({ commentId, page, enabled = true }: UseGetRepliesParams) {
  return useQuery({
    queryKey: ["replies", commentId, page],
    queryFn: async () => {
      const response = await httpClient.get<PaginatedResponse<CommentReplyResponse>>(
        `/api/comments/${commentId}/replies`,
        {
          params: { page, limit: 10 },
        }
      );
      return response.data;
    },
    enabled: enabled && !!commentId,
  });
}
