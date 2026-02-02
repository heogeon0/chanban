import { httpClient } from "@/lib/httpClient";
import {
  CommentReplyResponse,
  CommentResponse,
  CommentSortType,
  PaginatedResponse,
} from "@chanban/shared-types";
import { queryKeys } from "./keys";

/**
 * 댓글 관련 쿼리 옵션
 * queryKey와 queryFn을 함께 관리합니다.
 */
export const commentQueries = {
  /**
   * 댓글 목록 조회 쿼리 옵션
   * @param postId - 게시글 ID
   * @param sort - 정렬 방식 (popular: 인기순, latest: 최신순)
   */
  list: (postId: string, sort: CommentSortType = "popular") => ({
    queryKey: queryKeys.comment.list(postId, sort),
    queryFn: async () => {
      return await httpClient
        .get<PaginatedResponse<CommentResponse>>(`/api/comments/posts/${postId}`, {
          params: { sort },
        })
        .then((response) => response.data);
    },
  }),

  /**
   * 답글 목록 조회 쿼리 옵션
   * @param commentId - 부모 댓글 ID
   * @param page - 페이지 번호
   */
  replies: (commentId: string, page: number) => ({
    queryKey: queryKeys.comment.replies(commentId, page),
    queryFn: async () => {
      const response = await httpClient.get<PaginatedResponse<CommentReplyResponse>>(
        `/api/comments/${commentId}/replies`,
        {
          params: { page, limit: 10 },
        }
      );
      return response.data;
    },
  }),
};

/**
 * 댓글 관련 뮤테이션 함수
 */
export const commentMutations = {
  /**
   * 댓글 작성 API 호출
   */
  create: async (createCommentDto: CreateCommentDto) => {
    return await httpClient.post<CommentResponse, CreateCommentDto>(
      "/api/comments",
      createCommentDto
    );
  },

  /**
   * 댓글 좋아요 토글 API 호출
   */
  toggleLike: async ({ commentId, isLiked }: CommentLikeDto) => {
    if (isLiked) {
      return await httpClient.delete<void>(`/api/comments/${commentId}/like`);
    }
    return await httpClient.post<void>(`/api/comments/${commentId}/like`);
  },
};

// Types
export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

export interface CommentLikeDto {
  commentId: string;
  postId: string;
  isLiked: boolean;
}
