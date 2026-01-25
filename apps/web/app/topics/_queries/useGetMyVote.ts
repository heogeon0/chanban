import { httpClient } from "@/lib/httpClient";
import { ApiResponse, VoteResponse } from "@chanban/shared-types";
import { useQuery } from "@tanstack/react-query";

/**
 * 현재 사용자의 투표 상태 조회 훅
 *
 * @param postId - 조회할 게시물 ID
 * @returns UseQueryResult<VoteResponse | null>
 *
 * @example
 * const { data: myVote } = useGetMyVote(postId);
 * // myVote?.currentStatus로 현재 투표 상태 확인
 */
export function useGetMyVote(postId: string) {
  return useQuery({
    queryKey: ["myVote", postId],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<VoteResponse | null>>(
        `/api/votes/posts/${postId}/me`
      );
      return response.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
