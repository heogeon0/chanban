import { httpClient } from "@/lib/httpClient";
import { ApiResponse, PaginatedResponse, PostResponse, UserCommentResponse, UserResponse, VoteResponse } from "@chanban/shared-types";
import { queryKeys } from "./keys";

/**
 * 내 투표 내역 응답 타입 (post 관계 포함)
 */
export interface MyVoteResponse extends VoteResponse {
  post: PostResponse;
}

/**
 * 닉네임 수정 요청 타입
 */
export interface UpdateNicknameDto {
  nickname: string;
}

/**
 * 사용자 관련 쿼리 옵션
 */
export const userQueries = {
  /**
   * 내가 작성한 토픽 목록 쿼리 옵션
   * @param page - 페이지 번호
   */
  myPosts: (page: number) => ({
    queryKey: queryKeys.user.myPosts(page),
    queryFn: async () => {
      return await httpClient.get<PaginatedResponse<PostResponse>>(
        `/api/users/me/posts?page=${page}&limit=10`
      );
    },
  }),

  /**
   * 내 투표 내역 쿼리 옵션
   * @param page - 페이지 번호
   */
  myVotes: (page: number) => ({
    queryKey: queryKeys.user.myVotes(page),
    queryFn: async () => {
      return await httpClient.get<PaginatedResponse<MyVoteResponse>>(
        `/api/users/me/votes?page=${page}&limit=10`
      );
    },
  }),

  /**
   * 특정 사용자의 공개 프로필 쿼리 옵션
   * @param userId - 사용자 ID
   */
  profile: (userId: string) => ({
    queryKey: queryKeys.user.profile(userId),
    queryFn: async () =>
      httpClient.get<ApiResponse<UserResponse>>(`/api/users/${userId}/profile`),
  }),

  /**
   * 특정 사용자가 작성한 토픽 목록 쿼리 옵션
   * @param userId - 사용자 ID
   * @param page - 페이지 번호
   */
  userPosts: (userId: string, page: number) => ({
    queryKey: queryKeys.user.posts(userId, page),
    queryFn: async () =>
      httpClient.get<PaginatedResponse<PostResponse>>(
        `/api/users/${userId}/posts?page=${page}&limit=10`
      ),
  }),

  /**
   * 특정 사용자가 작성한 댓글 목록 쿼리 옵션
   * @param userId - 사용자 ID
   * @param page - 페이지 번호
   */
  userComments: (userId: string, page: number) => ({
    queryKey: queryKeys.user.comments(userId, page),
    queryFn: async () =>
      httpClient.get<PaginatedResponse<UserCommentResponse>>(
        `/api/users/${userId}/comments?page=${page}&limit=10`
      ),
  }),
};

/**
 * 사용자 관련 뮤테이션 함수
 */
export const userMutations = {
  /**
   * 닉네임 수정 API 호출
   */
  updateNickname: async (dto: UpdateNicknameDto) => {
    return await httpClient.patch<{ id: string; nickname: string }, UpdateNicknameDto>(
      "/api/users/me",
      dto
    );
  },
};
