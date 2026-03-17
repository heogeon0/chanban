import { httpClient } from "@/lib/httpClient";
import { ApiResponse, FollowCountsResponse, FollowStatusResponse } from "@chanban/shared-types";
import { queryKeys } from "./keys";

/**
 * 팔로우 관련 쿼리 옵션
 */
export const followQueries = {
  /**
   * 특정 사용자에 대한 팔로우 여부 쿼리 옵션
   * @param userId - 확인할 사용자 ID
   */
  status: (userId: string) => ({
    queryKey: queryKeys.follow.status(userId),
    queryFn: async () =>
      httpClient.get<ApiResponse<FollowStatusResponse>>(`/api/users/${userId}/follow-status`),
  }),

  /**
   * 특정 사용자의 팔로워/팔로잉 수 쿼리 옵션
   * @param userId - 확인할 사용자 ID
   */
  counts: (userId: string) => ({
    queryKey: queryKeys.follow.counts(userId),
    queryFn: async () =>
      httpClient.get<ApiResponse<FollowCountsResponse>>(`/api/users/${userId}/follow-counts`),
  }),
};

/**
 * 팔로우 관련 뮤테이션 함수
 */
export const followMutations = {
  /**
   * 팔로우 API 호출
   */
  follow: async (userId: string) =>
    httpClient.post(`/api/users/${userId}/follow`, {}),

  /**
   * 언팔로우 API 호출
   */
  unfollow: async (userId: string) =>
    httpClient.delete(`/api/users/${userId}/follow`),
};
