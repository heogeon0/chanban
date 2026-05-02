import { topicDomains } from "@/app/topics/domains";
import { queryKeys } from "./keys";

/**
 * 게시물 관련 쿼리 옵션 모음.
 * 메인 피드 RSC + Client Island 구조에서 island가 사용하는 카운트 묶음.
 */
export const postQueries = {
  stats: (postId: string) => ({
    queryKey: queryKeys.post.stats(postId),
    queryFn: async () => {
      const response = await topicDomains.getPostStats(postId);
      return response.data;
    },
    staleTime: 30_000,
  }),
};
