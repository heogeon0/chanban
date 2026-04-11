import { userQueries } from '@/shared/queries/user';
import { useInfiniteQuery } from '@tanstack/react-query';

/**
 * 내 댓글 내역 무한스크롤 훅
 * @param userId - 현재 로그인 사용자 ID
 */
export function useInfiniteMyComments(userId: string) {
  return useInfiniteQuery({
    queryKey: ['user', 'comments', userId, 'infinite'],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      userQueries.userComments(userId, pageParam).queryFn(),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!userId,
  });
}
