import { topicQueries } from "@/shared/queries";
import { PaginationMeta, PostTag } from "@chanban/shared-types";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * 무한스크롤을 위한 토픽 목록 조회 훅
 * 초기 데이터의 메타정보를 기반으로 다음 페이지부터 fetch
 *
 * @param tag - 조회할 태그 (PostTag, 'recent', 'hot')
 * @param initialMeta - 서버에서 받아온 초기 데이터의 메타정보
 */
export function useGetInfiniteTopics(
  tag: PostTag | "recent" | "hot",
  initialMeta: PaginationMeta
) {
  const initialHasNextPage = initialMeta.page < initialMeta.totalPages;
  const nextPage = initialMeta.page + 1;

  const query = useInfiniteQuery({
    queryKey: topicQueries.list(tag, nextPage).queryKey,
    queryFn: async ({ pageParam }) => {
      return topicQueries.list(tag, pageParam).queryFn();
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
