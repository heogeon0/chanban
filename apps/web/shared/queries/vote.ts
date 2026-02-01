import { httpClient } from "@/lib/httpClient";
import {
  ApiResponse,
  CreateVoteDto,
  VoteCountResponse,
  VoteResponse,
} from "@chanban/shared-types";
import { queryKeys } from "./keys";

/**
 * 투표 관련 쿼리 옵션
 * queryKey와 queryFn을 함께 관리합니다.
 */
export const voteQueries = {
  /**
   * 현재 사용자의 투표 상태 조회 쿼리 옵션
   * @param postId - 게시물 ID
   */
  my: (postId: string) => ({
    queryKey: queryKeys.vote.my(postId),
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<VoteResponse | null>>(
        `/api/votes/posts/${postId}/me`
      );
      return response.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  }),

  /**
   * 게시물의 투표 수 조회 쿼리 옵션
   * @param postId - 게시물 ID
   */
  count: (postId: string) => ({
    queryKey: queryKeys.vote.count(postId),
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<VoteCountResponse>>(
        `/api/posts/${postId}/vote-count`
      );
      return response.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  }),
};

/**
 * 투표 관련 뮤테이션 함수
 */
export const voteMutations = {
  /**
   * 투표 생성/업데이트 API 호출
   */
  create: async (createVoteDto: CreateVoteDto) => {
    const response = await httpClient.post<ApiResponse<VoteResponse>, CreateVoteDto>(
      "/api/votes",
      createVoteDto
    );
    return response.data;
  },
};
