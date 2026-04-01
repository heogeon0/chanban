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
    <div className="px-4 pt-6 pb-4 border-b border-border">
      {/* 아바타 + 팔로워/팔로잉 */}
      <div className="flex items-center gap-6">
        <UserAvatar
          user={user}
          size="lg"
          className="size-20 text-2xl rounded-full ring-4 ring-primary/20 shrink-0"
        />

        {/* 팔로워 / 팔로잉 */}
        <div className="flex flex-1 justify-around">
          <button
            onClick={() => onFollowSheetOpen('followers')}
            className="flex flex-col items-center gap-0.5"
          >
            <span className="text-xl font-bold">{followersCount}</span>
            <span className="text-xs text-muted-foreground">팔로워</span>
          </button>
          <button
            onClick={() => onFollowSheetOpen('following')}
            className="flex flex-col items-center gap-0.5"
          >
            <span className="text-xl font-bold">{followingCount}</span>
            <span className="text-xs text-muted-foreground">팔로잉</span>
          </button>
        </div>
      </div>

      {/* 닉네임 */}
      <div className="mt-3">
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
              className="text-base font-bold bg-transparent border-b-2 border-primary outline-none w-40"
            />
            <button
              type="submit"
              disabled={isPending}
              className="text-xs text-primary font-semibold hover:opacity-70 disabled:opacity-40"
            >
              {isPending ? '저장 중' : '저장'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-muted-foreground hover:opacity-70"
            >
              취소
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="text-base font-bold">{user?.nickname}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="닉네임 수정"
            >
              <Pencil className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 투표 / 토픽 통계 */}
      <div className="flex gap-3 mt-3">
        <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 border border-border px-3 py-2">
          <span className="text-sm font-bold text-opinion-agree">{totalVotes ?? 0}</span>
          <span className="text-xs text-muted-foreground">투표</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 border border-border px-3 py-2">
          <span className="text-sm font-bold text-opinion-agree">{totalTopics ?? 0}</span>
          <span className="text-xs text-muted-foreground">토픽</span>
        </div>
      </div>
    </div>
  );
}
