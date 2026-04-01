"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { Button } from "@/shared/ui/button";
import { followMutations, followQueries } from "@/shared/queries";
import { queryKeys } from "@/shared/queries/keys";
import { ApiResponse, FollowStatusResponse } from "@chanban/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface FollowButtonProps {
  userId: string;
}

/**
 * 팔로우/언팔로우 버튼 컴포넌트
 * - 비로그인 상태이거나 자기 자신인 경우 렌더링하지 않습니다.
 * - 낙관적 업데이트를 통해 즉각적인 UI 반응을 제공합니다.
 *
 * @param userId - 팔로우 대상 사용자 ID
 */
export function FollowButton({ userId }: FollowButtonProps) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const isSelf = user?.id === userId;
  const shouldShow = isAuthenticated && !isSelf;

  const { data, isLoading: isStatusLoading } = useQuery({
    ...followQueries.status(userId),
    enabled: shouldShow,
  });

  const isFollowing = data?.data?.isFollowing ?? false;

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      isFollowing ? followMutations.unfollow(userId) : followMutations.follow(userId),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.follow.status(userId) });
      const prev = queryClient.getQueryData<ApiResponse<FollowStatusResponse>>(
        queryKeys.follow.status(userId)
      );
      queryClient.setQueryData(queryKeys.follow.status(userId), {
        data: { isFollowing: !isFollowing },
      });
      return { prev };
    },

    onError: (_error, _variables, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(queryKeys.follow.status(userId), context.prev);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.follow.status(userId) });
    },
  });

  if (isAuthLoading || !shouldShow) {
    return null;
  }

  if (isStatusLoading) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "default" : "ghost"}
      size="sm"
      className="h-7 px-3 text-xs"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isFollowing ? "팔로잉" : "팔로우"}
    </Button>
  );
}
