import { httpClient } from "@/lib/httpClient";
import { queryKeys } from "@/shared/queries/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 관리자 전용 공식 투표 삭제 mutation.
 *
 * 백엔드 계약: `DELETE /api/posts/official/:id` (204 또는 200)
 *
 * 성공 시:
 * - 공식 피드 무한쿼리 캐시 무효화
 * - 해당 게시물 상세 캐시 제거
 * - RSC fetch 캐시(`official-feed` 태그)까지 즉시 무효화
 */
export function useDeleteOfficialPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete<unknown>(`/api/posts/official/${id}`);
      return { id };
    },
    onSuccess: async ({ id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.topic.officialInfinite(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.topic.detail(id),
      });
      try {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tag: "official-feed" }),
        });
      } catch {
        // 클라이언트 캐시는 이미 무효화됐으므로 사용자 흐름은 막지 않음
      }
    },
  });
}
