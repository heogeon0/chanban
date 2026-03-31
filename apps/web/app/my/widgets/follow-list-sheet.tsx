"use client";

import { FollowButton } from "@/shared/components/follow-button";
import { FollowUserResponse } from "@chanban/shared-types";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { BottomSheet } from "@/shared/ui/bottom-sheet";
import { UserAvatar } from "@/shared/ui/avatar";
import { useEffect, useRef } from "react";
import { useInfiniteFollowList } from "../features/use-infinite-follow-list";

type FollowListType = "followers" | "following";

interface FollowListSheetProps {
  userId: string;
  type: FollowListType | null;
  onClose: () => void;
  contained?: boolean;
}

const TITLE: Record<FollowListType, string> = {
  followers: "팔로워",
  following: "팔로잉",
};

/**
 * 팔로워/팔로잉 목록 바텀 시트
 * @param userId - 조회할 사용자 ID
 * @param type - 'followers' | 'following' | null (null이면 닫힘)
 * @param onClose - 닫기 핸들러
 */
export function FollowListSheet({ userId, type, onClose, contained }: FollowListSheetProps) {
  const isOpen = type !== null;
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteFollowList(userId, type ?? "followers");

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { entries } = useIntersectionObserver(loadMoreRef, { threshold: 0.5 });

  useEffect(() => {
    if (entries.length > 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entries, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allUsers = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={type ? TITLE[type] : ""} contained={contained}>
      {isLoading ? (
        <FollowListSkeleton />
      ) : allUsers.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          {type === "followers" ? "팔로워가 없습니다." : "팔로잉하는 사람이 없습니다."}
        </div>
      ) : (
        <>
          <div className="divide-y divide-border/50">
            {allUsers.map((user) => (
              <FollowUserRow key={user.id} user={user} />
            ))}
          </div>
          <div ref={loadMoreRef} className="flex items-center justify-center py-6">
            {isFetchingNextPage ? (
              <p className="text-sm text-muted-foreground">로딩 중...</p>
            ) : !hasNextPage ? (
              <p className="text-sm text-muted-foreground">모든 항목을 불러왔습니다</p>
            ) : null}
          </div>
        </>
      )}
    </BottomSheet>
  );
}

function FollowUserRow({ user }: { user: FollowUserResponse }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <UserAvatar user={user} size="sm" />
      <p className="flex-1 text-sm font-semibold">{user.nickname}</p>
      <FollowButton userId={user.id} />
    </div>
  );
}

function FollowListSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="size-8 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
