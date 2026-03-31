import { followQueries } from "@/shared/queries/follow";
import { useInfiniteQuery } from "@tanstack/react-query";

type FollowListType = "followers" | "following";

/**
 * 팔로워/팔로잉 목록 무한스크롤 훅
 * @param userId - 조회할 사용자 ID
 * @param type - 'followers' 또는 'following'
 */
export function useInfiniteFollowList(userId: string, type: FollowListType) {
  return useInfiniteQuery({
    queryKey: ["follow", type, userId, "infinite"],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      followQueries[type](userId, pageParam).queryFn(),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!userId,
  });
}
