import { httpClient } from "@/lib/httpClient";
import { queryKeys } from "@/shared/queries/keys";
import {
  ApiResponse,
  PostResponse,
  PostTag,
} from "@chanban/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * 관리자 전용 공식 투표 수정 DTO.
 * 백엔드 계약: `PUT /api/posts/official/:id`
 */
export interface UpdateOfficialPostDto {
  title: string;
  content: string;
  tag: PostTag;
  showCreatorOpinion: boolean;
}

/**
 * 관리자 전용 공식 투표 수정 mutation.
 *
 * 성공 시:
 * - 공식 피드 무한쿼리 캐시 무효화
 * - 해당 게시물 상세 캐시 무효화
 * - RSC fetch 캐시(`official-feed` 태그)까지 즉시 무효화
 */
export function useUpdateOfficialPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOfficialPostDto;
    }) => {
      const response = await httpClient.put<
        ApiResponse<PostResponse>,
        UpdateOfficialPostDto
      >(`/api/posts/official/${id}`, data);
      return response.data;
    },
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.topic.officialInfinite(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.topic.detail(variables.id),
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
