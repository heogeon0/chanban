import { httpClient } from "@/lib/httpClient";
import {
  ApiResponse,
  CreateVoteDto,
  VoteCountResponse,
  VoteResponse,
} from "@chanban/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

/**
 * 투표 생성/업데이트 mutation 훅
 */
export function usePostVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (createVoteDto: CreateVoteDto) => {
      return await httpClient.post<VoteResponse, CreateVoteDto>(
        "/api/votes",
        createVoteDto
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.topic.detail(variables.postId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.vote.count(variables.postId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.vote.my(variables.postId),
      });
    },
  });
}

/**
 * 현재 사용자의 투표 상태 조회 훅
 *
 * @param postId - 조회할 게시물 ID
 */
export function useGetMyVote(postId: string) {
  return useQuery({
    queryKey: queryKeys.vote.my(postId),
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

/**
 * 게시물의 투표 수 조회 훅
 *
 * @param postId - 조회할 게시물 ID
 */
export function useGetVoteCount(postId: string) {
  return useQuery({
    queryKey: queryKeys.vote.count(postId),
    queryFn: async () => {
      return await httpClient
        .get<ApiResponse<VoteCountResponse>>(`/api/posts/${postId}/vote-count`)
        .then((response) => response.data);
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
