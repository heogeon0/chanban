import { topicDomains } from "@/app/topics/domains";
import { queryKeys } from "@/shared/queries/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * 관리자 전용 공식 투표 생성 mutation
 * 성공 시 메인 피드(`/`) 캐시 무효화 + 메인으로 이동
 */
export function useCreateOfficialPost() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topicDomains.createOfficialPost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.topic.officialInfinite(),
      });
      router.push("/");
    },
  });
}
