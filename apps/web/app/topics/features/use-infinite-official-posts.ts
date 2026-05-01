import { topicQueries } from "@/shared/queries";
import { queryKeys } from "@/shared/queries/keys";
import { PaginationMeta } from "@chanban/shared-types";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * 공식(관리자) 투표 피드 무한스크롤 훅
 * @param initialMeta - 서버에서 받아온 초기 데이터 메타정보
 */
export function useGetInfiniteOfficialPosts(initialMeta: PaginationMeta) {
  const initialHasNextPage = initialMeta.page < initialMeta.totalPages;
  const nextPage = initialMeta.page + 1;

  const query = useInfiniteQuery({
    queryKey: queryKeys.topic.officialInfinite(),
    queryFn: async ({ pageParam }) => {
      return topicQueries.official(pageParam).queryFn();
    },
    initialPageParam: nextPage,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: false,
  });

  return {
    ...query,
    hasNextPage: query.data ? query.hasNextPage : initialHasNextPage,
  };
}
