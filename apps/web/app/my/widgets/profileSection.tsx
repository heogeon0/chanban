'use client';

import { useAuth } from '@/shared/contexts/auth-context';
import { followQueries } from '@/shared/queries/follow';
import { UserAvatar } from '@/shared/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useUpdateNickname } from '../features/use-update-nickname';

interface ProfileSectionProps {
  totalVotes?: number;
  totalTopics?: number;
}

/**
 * 마이페이지 프로필 섹션
 * 아바타, 닉네임 수정, 통계, 로그아웃 포함
 */
export function ProfileSection({ totalVotes, totalTopics }: ProfileSectionProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="px-4 py-8 border-b border-border flex flex-col items-center gap-3">
      {/* 아바타 */}
      <UserAvatar
        user={user}
        size="md"
        className="size-20 text-2xl rounded-full ring-4 ring-primary/20"
      />

      {/* 닉네임 */}
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
            className="text-xl font-bold bg-transparent border-b-2 border-primary outline-none w-40 text-center"
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
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold">{user?.nickname}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="닉네임 수정"
          >
            <Pencil className="size-4" />
          </button>
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-2 w-full mt-3">
        {[
          { value: totalVotes ?? 0, label: 'VOTES' },
          { value: totalTopics ?? 0, label: 'TOPICS' },
          { value: followersCount, label: '팔로워' },
          { value: followingCount, label: '팔로잉' },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 border border-border py-3 px-1"
          >
            <p className="text-xl font-bold text-opinion-agree">{value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* 로그아웃 */}
      <button
        onClick={handleLogout}
        className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
      >
        로그아웃
      </button>
    </div>
  );
}
