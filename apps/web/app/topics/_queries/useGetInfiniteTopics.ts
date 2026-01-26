import { httpClient } from "@/lib/httpClient";
import { PaginatedResponse, PaginationMeta, PostResponse, PostTag } from "@chanban/shared-types";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * 무한스크롤을 위한 토픽 목록 조회 훅
 * 초기 데이터의 메타정보를 기반으로 다음 페이지부터 fetch
 *
 * @param tag - 조회할 태그 (PostTag, 'recent', 'hot')
 * @param initialMeta - 서버에서 받아온 초기 데이터의 메타정보
 * @returns useInfiniteQuery 결과
 */
export function useGetInfiniteTopics(
  tag: PostTag | 'recent' | 'hot',
  initialMeta: PaginationMeta
) {
  const initialHasNextPage = initialMeta.page < initialMeta.totalPages;
  const nextPage = initialMeta.page + 1;

  const query = useInfiniteQuery({
    queryKey: ['topics', tag],
    queryFn: async ({ pageParam }) => {
      let url: string;

      if (tag === 'recent') {
        url = `/api/posts/recent?page=${pageParam}`;
      } else if (tag === 'hot') {
        url = `/api/posts/recent?sort=popular&page=${pageParam}`;
      } else {
        url = `/api/posts/tags/${tag}?page=${pageParam}`;
      }

      return await httpClient.get<PaginatedResponse<PostResponse>>(url);
    },
    initialPageParam: nextPage,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: false, // 자동 fetch 비활성화, fetchNextPage()로만 호출
  });


  return {
    ...query,
    hasNextPage: query.data ? query.hasNextPage : initialHasNextPage,
  };
}
