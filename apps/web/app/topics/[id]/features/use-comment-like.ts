import { isHttpError } from "@/lib/httpClient";
import { commentMutations, CommentLikeDto } from "@/shared/queries";
import { CommentResponse, PaginatedResponse } from "@chanban/shared-types";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const HTTP_STATUS_UNAUTHORIZED = 401;

type CommentsInfiniteData = InfiniteData<PaginatedResponse<CommentResponse>>;

interface OptimisticContext {
  previousData: Map<string, CommentsInfiniteData>;
}

/**
 * 댓글 좋아요 mutation 훅
 * 낙관적 업데이트가 적용되어 즉시 UI가 반영됩니다.
 * 401 에러 발생 시 로그인 페이지로 이동합니다.
 */
export function useCommentLike() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: commentMutations.toggleLike,

    onMutate: async (variables: CommentLikeDto): Promise<OptimisticContext> => {
      await queryClient.cancelQueries({
        queryKey: ["comments", variables.postId],
      });

      const previousData = new Map<string, CommentsInfiniteData>();
      const queries = queryClient.getQueriesData<CommentsInfiniteData>({
        queryKey: ["comments", variables.postId],
      });

      queries.forEach(([queryKey, data]) => {
        if (data) {
          previousData.set(JSON.stringify(queryKey), data);
        }
      });

      const newIsLiked = !variables.isLiked;
      const likeCountDelta = newIsLiked ? 1 : -1;

      queries.forEach(([queryKey, data]) => {
        if (!data) return;

        const updatedPages = data.pages.map((page) => ({
          ...page,
          data: page.data.map((comment) => {
            // 원댓글인 경우
            if (comment.id === variables.commentId) {
              return {
                ...comment,
                isLiked: newIsLiked,
                likeCount: comment.likeCount + likeCountDelta,
              };
            }

            // 대댓글인 경우
            const updatedReplies = comment.replies.map((reply) => {
              if (reply.id === variables.commentId) {
                return {
                  ...reply,
                  isLiked: newIsLiked,
                  likeCount: reply.likeCount + likeCountDelta,
                };
              }
              return reply;
            });

            return { ...comment, replies: updatedReplies };
          }),
        }));

        queryClient.setQueryData(queryKey, { ...data, pages: updatedPages });
      });

      return { previousData };
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach((data, keyString) => {
          const queryKey = JSON.parse(keyString);
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (isHttpError(error) && error.status === HTTP_STATUS_UNAUTHORIZED) {
        router.push(`/auth/login?returnUrl=${window.location.pathname}`);
      }
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
    },
  });
}
