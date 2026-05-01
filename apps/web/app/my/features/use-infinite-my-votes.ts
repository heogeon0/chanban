import { userQueries } from "@/shared/queries/user";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * 내 투표 내역 무한스크롤 훅
 */
export function useInfiniteMyVotes() {
  return useInfiniteQuery({
    queryKey: ["user", "votes", "infinite"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      userQueries.myVotes(pageParam).queryFn(),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
