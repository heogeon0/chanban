'use client';

import { useAuth } from '@/shared/contexts/auth-context';
import { followQueries } from '@/shared/queries/follow';
import { UserAvatar } from '@/shared/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import { useUpdateNickname } from '../features/use-update-nickname';

interface ProfileSectionProps {
  totalVotes?: number;
  totalTopics?: number;
  onFollowSheetOpen: (type: 'followers' | 'following') => void;
}

/**
 * 마이페이지 프로필 섹션
 * 아바타, 닉네임 수정, 팔로워/팔로잉(클릭), 투표/토픽 통계 포함
 *
 * @param onFollowSheetOpen - 팔로워/팔로잉 클릭 시 호출되는 콜백
 */
export function ProfileSection({ totalVotes, totalTopics, onFollowSheetOpen }: ProfileSectionProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUpdateNickname();

  const { data: countsData } = useQuery({
    ...followQueries.counts(user?.id ?? ''),
    enabled: !!user?.id,
  });
  const followersCount = countsData?.data?.followersCount ?? 0;
  const followingCount = countsData?.data?.followingCount ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nickname = inputRef.current?.value.trim();
    if (!nickname || nickname === user?.nickname) {
      setIsEditing(false);
      return;
    }
    mutate({ nickname }, { onSuccess: () => setIsEditing(false) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsEditing(false);
  };

  return (
    <div className="px-5 pt-6 pb-5 border-b border-border">
      {/* 아바타 + 팔로워/팔로잉 */}
      <div className="flex items-center gap-6">
        <UserAvatar
          user={user}
          size="lg"
          className="size-[72px] text-xl rounded-full ring-2 ring-opinion-agree/40 shrink-0"
        />

        {/* 팔로워 / 팔로잉 */}
        <div className="flex flex-1 items-center justify-around">
          <button
            onClick={() => onFollowSheetOpen('followers')}
            className="flex flex-col items-center gap-0.5 active:opacity-50 transition-opacity"
          >
            <span className="text-2xl font-bold tracking-tight">{followersCount}</span>
            <span className="text-[11px] text-muted-foreground font-medium">팔로워</span>
          </button>

          <div className="w-px h-8 bg-border" />

          <button
            onClick={() => onFollowSheetOpen('following')}
            className="flex flex-col items-center gap-0.5 active:opacity-50 transition-opacity"
          >
            <span className="text-2xl font-bold tracking-tight">{followingCount}</span>
            <span className="text-[11px] text-muted-foreground font-medium">팔로잉</span>
          </button>
        </div>
      </div>

      {/* 닉네임 */}
      <div className="mt-3.5">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              defaultValue={user?.nickname}
              minLength={2}
              maxLength={20}
              disabled={isPending}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-[15px] font-bold bg-transparent border-b-2 border-primary outline-none w-36"
            />
            <button
              type="submit"
              disabled={isPending}
              className="text-xs text-primary font-semibold hover:opacity-70 disabled:opacity-40 transition-opacity"
            >
              {isPending ? '저장 중' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-muted-foreground hover:opacity-70 transition-opacity"
            >
              취소
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 group"
          >
            <span className="text-[15px] font-bold">{user?.nickname}</span>
            <Pencil className="size-3 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
          </button>
        )}
      </div>

      {/* 투표 / 토픽 */}
      <div className="flex items-center gap-2 mt-3">
        <span className="inline-flex items-center gap-1 text-[11px] bg-muted/70 rounded-full px-2.5 py-1">
          <span className="font-bold text-opinion-agree">{totalVotes ?? 0}</span>
          <span className="text-muted-foreground">투표</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] bg-muted/70 rounded-full px-2.5 py-1">
          <span className="font-bold text-opinion-agree">{totalTopics ?? 0}</span>
          <span className="text-muted-foreground">토픽</span>
        </span>
      </div>
    </div>
  );
}
