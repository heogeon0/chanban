import { httpClient } from "@/lib/httpClient";
import { ApiResponse, VoteCountResponse } from "@chanban/shared-types";
import { useQuery } from "@tanstack/react-query";

/**
 * 게시물의 투표 수 조회 훅
 *
 * @param postId - 조회할 게시물 ID
 * @returns UseQueryResult<VoteCountResponse>
 *
 * @example
 * const { data, isLoading } = useGetVoteCount(postId);
 */
export function useGetVoteCount(postId: string) {
  return useQuery({
    queryKey: ["voteCount", postId],
    queryFn: async () => {
      return await httpClient.get<ApiResponse<VoteCountResponse>>(
        `/api/posts/${postId}/vote-count`
      ).then(response => response.data);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
