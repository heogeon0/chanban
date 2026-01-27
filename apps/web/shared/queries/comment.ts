import { httpClient } from "@/lib/httpClient";
import {
  CommentReplyResponse,
  CommentResponse,
  PaginatedResponse,
} from "@chanban/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

interface CommentLikeDto {
  commentId: string;
  postId: string;
  isLiked: boolean;
}

interface UseGetRepliesParams {
  commentId: string;
  page: number;
  enabled?: boolean;
}

/**
 * 댓글 목록 조회 query 훅
 * 특정 게시글의 댓글 목록을 가져옵니다.
 *
 * @param postId - 게시글 ID
 */
export function useGetComments(postId: string) {
  return useQuery({
    queryKey: queryKeys.comment.list(postId),
    queryFn: async () => {
      return await httpClient
        .get<PaginatedResponse<CommentResponse>>(`/api/comments/posts/${postId}`)
        .then((response) => response.data);
    },
    enabled: !!postId,
  });
}

/**
 * 댓글 작성 mutation 훅
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
      queryClient.invalidateQueries({
        queryKey: queryKeys.comment.list(variables.postId),
      });

      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: ["replies", variables.parentId],
        });
      }
    },
  });
}

/**
 * 댓글 좋아요 mutation 훅
 * 댓글에 좋아요를 추가하거나 취소합니다.
 */
export function useCommentLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, isLiked }: CommentLikeDto) => {
      if (isLiked) {
        return await httpClient.delete<void>(`/api/comments/${commentId}/like`);
      }
      return await httpClient.post<void>(`/api/comments/${commentId}/like`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comment.list(variables.postId),
      });
    },
  });
}

/**
 * 특정 댓글의 답글 목록을 추가로 조회하는 query 훅
 * "답글 더보기" 기능에서 사용됩니다.
 *
 * @param commentId - 부모 댓글 ID
 * @param page - 페이지 번호
 * @param enabled - 쿼리 활성화 여부
 */
export function useGetReplies({
  commentId,
  page,
  enabled = true,
}: UseGetRepliesParams) {
  return useQuery({
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
    enabled: enabled && !!commentId,
  });
}
