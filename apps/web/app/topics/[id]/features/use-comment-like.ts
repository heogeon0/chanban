import { isHttpError } from "@/lib/httpClient";
import { commentMutations } from "@/shared/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const HTTP_STATUS_UNAUTHORIZED = 401;

/**
 * 댓글 좋아요 mutation 훅
 * 댓글에 좋아요를 추가하거나 취소합니다.
 * 401 에러 발생 시 로그인 모달을 표시합니다.
 */
export function useCommentLike() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: commentMutations.toggleLike,
    onSuccess: (_, variables) => {
      // 모든 정렬 타입의 댓글 목록을 무효화 (popular, latest 모두)
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "comments" &&
          query.queryKey[1] === variables.postId,
      });
    },
    onError: (error) => {
      if (isHttpError(error) && error.status === HTTP_STATUS_UNAUTHORIZED) {
        router.push("/auth/login");
      }
    },
  });
}
