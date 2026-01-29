import { isHttpError } from "@/lib/httpClient";
import { queryKeys, voteMutations } from "@/shared/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const HTTP_STATUS_UNAUTHORIZED = 401;

/**
 * 투표 생성/업데이트 mutation 훅
 * 투표 후 관련 쿼리들을 자동으로 invalidate 합니다.
 * 401 에러 발생 시 로그인 모달을 표시합니다.
 */
export function usePostVote() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: voteMutations.create,
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
    onError: (error) => {
      if (isHttpError(error) && error.status === HTTP_STATUS_UNAUTHORIZED) {
        router.push("/auth/login");
      }
    },
  });
}
