import { topicQueries } from "@/shared/queries";
import { queryKeys } from "@/shared/queries/keys";
import { PaginatedResponse, PostResponse, PostTag } from "@chanban/shared-types";
import { useInfiniteQuery } from "@tanstack/react-query";

type InitialPage = PaginatedResponse<PostResponse>;

/**
 * 무한스크롤 토픽 목록 조회 훅
 * 서버에서 받아온 초기 1페이지를 `initialData`로 주입해 캐시를 시드하고,
 * 이후 `fetchNextPage`로 다음 페이지부터 로드한다.
 * `initialData` 미제공 시에는 1페이지부터 클라이언트에서 fetch (검색 페이지 등 재사용).
 *
 * @param tag - 조회할 태그 (PostTag, 'recent', 'hot')
 * @param initialPage - 서버에서 pre-fetch한 1페이지 (선택)
 */
export function useGetInfiniteTopics(
  tag: PostTag | "recent" | "hot",
  initialPage?: InitialPage,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.topic.infiniteList(tag),
    queryFn: async ({ pageParam }) => {
      return topicQueries.list(tag, pageParam as number).queryFn();
    },
    initialPageParam: 1,
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [1] }
      : undefined,
    initialDataUpdatedAt: initialPage ? Date.now() : undefined,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
