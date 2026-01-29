import { queryKeys, voteMutations } from "@/shared/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 투표 생성/업데이트 mutation 훅
 * 투표 후 관련 쿼리들을 자동으로 invalidate 합니다.
 */
export function usePostVote() {
  const queryClient = useQueryClient();

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
  });
}
