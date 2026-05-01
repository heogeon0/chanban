import { userQueries } from "@/shared/queries/user";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * 내가 작성한 토픽 목록 무한스크롤 훅
 */
export function useInfiniteMyTopics() {
  return useInfiniteQuery({
    queryKey: ["user", "posts", "infinite"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      userQueries.myPosts(pageParam).queryFn(),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
