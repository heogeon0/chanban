"use client";

import { FollowButton } from "@/shared/components/follow-button";
import { followQueries } from "@/shared/queries";
import { UserAvatar } from "@/shared/ui/avatar";
import { UserResponse } from "@chanban/shared-types";
import { useQuery } from "@tanstack/react-query";

interface ProfileHeaderProps {
  user: UserResponse;
  totalTopics: number;
}

interface StatItemProps {
  value: number;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-2xl desktop:text-3xl font-black leading-none">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * 프로필 헤더 컴포넌트
 * 팔로워/팔로잉 수를 동적으로 조회해 인스타그램 스타일로 표시합니다.
 */
export function ProfileHeader({ user, totalTopics }: ProfileHeaderProps) {
  const { data: countsData } = useQuery(followQueries.counts(user.id));

  const followersCount = countsData?.data?.followersCount ?? 0;
  const followingCount = countsData?.data?.followingCount ?? 0;

  return (
    <div className="flex items-center gap-8 desktop:gap-16 mb-8 pb-8 border-b border-border">
      {/* 아바타 */}
      <UserAvatar
        user={user}
        size="lg"
        className="size-20 desktop:size-28 text-3xl shrink-0"
      />

      {/* 우측 정보 */}
      <div className="flex items-center justify-between flex-1">
        {/* 닉네임 + 팔로우 버튼 */}
        <div className="flex items-center gap-3">
          <p className="text-xl desktop:text-2xl font-bold">{user.nickname}</p>
          <FollowButton userId={user.id} />
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-8 desktop:gap-12">
          <StatItem value={totalTopics} label="게시글" />
          <StatItem value={followersCount} label="팔로워" />
          <StatItem value={followingCount} label="팔로잉" />
        </div>
      </div>
    </div>
  );
}
