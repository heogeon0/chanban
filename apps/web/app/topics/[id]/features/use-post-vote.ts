import { isHttpError } from "@/lib/httpClient";
import { queryKeys, voteMutations } from "@/shared/queries";
import { VoteCountResponse, VoteResponse, VoteStatus } from "@chanban/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const HTTP_STATUS_UNAUTHORIZED = 401;

interface OptimisticContext {
  previousMyVote: VoteResponse | null | undefined;
  previousVoteCount: VoteCountResponse | undefined;
}

/**
 * 투표 수 변경값을 계산합니다.
 * @param oldStatus - 이전 투표 상태
 * @param newStatus - 새로운 투표 상태
 */
function calculateVoteCountDelta(
  oldStatus: VoteStatus | null,
  newStatus: VoteStatus
): { agree: number; disagree: number; neutral: number } {
  const delta = { agree: 0, disagree: 0, neutral: 0 };

  if (oldStatus === VoteStatus.AGREE) delta.agree -= 1;
  if (oldStatus === VoteStatus.DISAGREE) delta.disagree -= 1;
  if (oldStatus === VoteStatus.NEUTRAL) delta.neutral -= 1;

  if (newStatus === VoteStatus.AGREE) delta.agree += 1;
  if (newStatus === VoteStatus.DISAGREE) delta.disagree += 1;
  if (newStatus === VoteStatus.NEUTRAL) delta.neutral += 1;

  return delta;
}

/**
 * 투표 생성/업데이트 mutation 훅
 * 낙관적 업데이트를 적용하여 즉각적인 UI 반응을 제공합니다.
 * 401 에러 발생 시 로그인 모달을 표시합니다.
 */
export function usePostVote() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: voteMutations.create,

    onMutate: async (variables): Promise<OptimisticContext> => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.vote.my(variables.postId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.vote.count(variables.postId),
      });

      const previousMyVote = queryClient.getQueryData<VoteResponse | null>(
        queryKeys.vote.my(variables.postId)
      );
      const previousVoteCount = queryClient.getQueryData<VoteCountResponse>(
        queryKeys.vote.count(variables.postId)
      );

      // 낙관적으로 myVote 업데이트
      queryClient.setQueryData<VoteResponse | null>(
        queryKeys.vote.my(variables.postId),
        (old) => ({
          id: old?.id ?? "optimistic",
          postId: variables.postId,
          userId: old?.userId ?? "optimistic",
          currentStatus: variables.status,
          changeCount: (old?.changeCount ?? 0) + 1,
          firstVotedAt: old?.firstVotedAt ?? new Date(),
          lastChangedAt: new Date(),
        })
      );

      // 낙관적으로 voteCount 업데이트
      if (previousVoteCount) {
        const oldStatus = previousMyVote?.currentStatus ?? null;
        const delta = calculateVoteCountDelta(oldStatus, variables.status);

        queryClient.setQueryData<VoteCountResponse>(
          queryKeys.vote.count(variables.postId),
          {
            agreeCount: Math.max(0, previousVoteCount.agreeCount + delta.agree),
            disagreeCount: Math.max(0, previousVoteCount.disagreeCount + delta.disagree),
            neutralCount: Math.max(0, previousVoteCount.neutralCount + delta.neutral),
          }
        );
      }

      return { previousMyVote, previousVoteCount };
    },

    onError: (error, variables, context) => {
      // 에러 시 롤백
      if (context?.previousMyVote !== undefined) {
        queryClient.setQueryData(
          queryKeys.vote.my(variables.postId),
          context.previousMyVote
        );
      }
      if (context?.previousVoteCount) {
        queryClient.setQueryData(
          queryKeys.vote.count(variables.postId),
          context.previousVoteCount
        );
      }

      if (isHttpError(error) && error.status === HTTP_STATUS_UNAUTHORIZED) {
        router.push("/auth/login");
      }
    },

    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.vote.my(variables.postId), data);
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vote.count(variables.postId),
      });
    },
  });
}
