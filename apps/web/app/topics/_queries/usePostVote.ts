import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/httpClient";
import { CreateVoteDto, VoteResponse } from "@chanban/shared-types";

/**
 * 투표 생성/업데이트 mutation 훅
 *
 * @returns UseMutationResult<VoteResponse, Error, CreateVoteDto>
 *
 * @example
 * const { mutate, isPending } = usePostVote();
 *
 * mutate({
 *   postId: "post-uuid",
 *   status: VoteStatus.AGREE
 * }, {
 *   onSuccess: () => {
 *     // 투표 성공 시 처리
 *   }
 * });
 */
export function usePostVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (createVoteDto: CreateVoteDto) => {
      return await httpClient.post<VoteResponse, CreateVoteDto>(
        "/api/votes",
        createVoteDto
      );
    },
    onSuccess: (_, variables) => {
      // 토픽 상세 정보 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({
        queryKey: ["topic", variables.postId],
      });

      // 투표 수 쿼리 무효화하여 실시간 업데이트
      queryClient.invalidateQueries({
        queryKey: ["voteCount", variables.postId],
      });

      // 내 투표 정보 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ["myVote", variables.postId],
      });
    },
  });
}
