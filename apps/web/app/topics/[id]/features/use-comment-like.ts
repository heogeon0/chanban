import { isHttpError } from "@/lib/httpClient";
import { commentMutations, CommentLikeDto } from "@/shared/queries";
import { CommentResponse } from "@chanban/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const HTTP_STATUS_UNAUTHORIZED = 401;

interface OptimisticContext {
  previousComments: Map<string, CommentResponse[]>;
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
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: ["comments", variables.postId],
      });

      // 이전 데이터 저장 (모든 정렬 타입)
      const previousComments = new Map<string, CommentResponse[]>();
      const queries = queryClient.getQueriesData<CommentResponse[]>({
        queryKey: ["comments", variables.postId],
      });

      queries.forEach(([queryKey, data]) => {
        if (data) {
          previousComments.set(JSON.stringify(queryKey), data);
        }
      });

      // 낙관적 업데이트: isLiked 토글, likeCount 증감
      const newIsLiked = !variables.isLiked;
      const likeCountDelta = newIsLiked ? 1 : -1;

      queries.forEach(([queryKey, data]) => {
        if (!data) return;

        const updatedComments = data.map((comment) => {
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
        });

        queryClient.setQueryData(queryKey, updatedComments);
      });

      return { previousComments };
    },

    onError: (error, variables, context) => {
      // 에러 시 롤백
      if (context?.previousComments) {
        context.previousComments.forEach((data, keyString) => {
          const queryKey = JSON.parse(keyString);
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (isHttpError(error) && error.status === HTTP_STATUS_UNAUTHORIZED) {
        router.push("/auth/login");
      }
    },

    onSettled: (_, __, variables) => {
      // 서버와 동기화
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.postId],
      });
    },
  });
}
