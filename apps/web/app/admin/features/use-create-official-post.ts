import { topicDomains } from "@/app/topics/domains";
import { queryKeys } from "@/shared/queries/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * 관리자 전용 공식 투표 생성 mutation.
 * 성공 시:
 * - React Query 무한쿼리 캐시 무효화
 * - Next.js RSC fetch 캐시 무효화 (`/api/revalidate`로 official-feed 태그)
 * - 어드민 공식 토론 목록으로 이동
 */
export function useCreateOfficialPost() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: topicDomains.createOfficialPost,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.topic.officialInfinite(),
      });
      // RSC fetch 캐시까지 즉시 무효화해 첫 진입 SSR이 새 글을 바로 반영하도록 함
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag: "official-feed" }),
        });
      } catch {
        // 실패해도 client-side 무효화는 됐으니 사용자 흐름은 막지 않음
      }
      router.push("/admin/posts");
    },
  });
}
