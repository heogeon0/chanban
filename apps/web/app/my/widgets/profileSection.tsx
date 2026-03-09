'use client';

import { useAuth } from '@/shared/contexts/auth-context';
import { UserAvatar } from '@/shared/ui/avatar';
import { Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import { useUpdateNickname } from '../features/use-update-nickname';

interface ProfileSectionProps {
  totalVotes?: number;
  totalTopics?: number;
}

/**
 * 마이페이지 프로필 섹션
 * 모바일: 중앙 정렬 + 통계 카드 그리드
 * 데스크탑: 수평 레이아웃 + 통계 인라인
 */
export function ProfileSection({ totalVotes, totalTopics }: ProfileSectionProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUpdateNickname();

  const hasStats = totalVotes !== undefined || totalTopics !== undefined;

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
    <div className="px-4 py-8 desktop:px-8 desktop:py-10 border-b border-border">
      {/* 모바일: 중앙 정렬 컬럼 / 데스크탑: 수평 row */}
      <div className="flex flex-col items-center gap-4 desktop:flex-row desktop:items-center desktop:justify-start">
        {/* 아바타 */}
        <UserAvatar
          user={user}
          size="md"
          className="size-24 desktop:size-28 text-2xl rounded-full ring-4 ring-primary/20"
        />

        {/* 닉네임 + 수정 */}
        <div className="flex flex-col items-center gap-1.5 desktop:items-start">
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
                className="text-2xl desktop:text-3xl font-bold leading-tight bg-transparent border-b-2 border-primary outline-none w-40 desktop:w-52 text-center desktop:text-left"
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
              <p className="text-2xl desktop:text-3xl font-bold leading-tight">
                {user?.nickname}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                aria-label="닉네임 수정"
              >
                <Pencil className="size-4" />
              </button>
            </div>
          )}

          {/* 통계 - 데스크탑 인라인 */}
          {hasStats && (
            <p className="text-sm text-muted-foreground hidden desktop:block">
              {[
                totalVotes !== undefined && `${totalVotes} Votes`,
                totalTopics !== undefined && `${totalTopics} Topics`,
              ]
                .filter(Boolean)
                .join(' • ')}
            </p>
          )}
        </div>
      </div>

      {/* 통계 카드 - 모바일 전용 */}
      {hasStats && (
        <div className="grid grid-cols-2 gap-3 mt-6 desktop:hidden">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 border border-border p-4">
            <p className="text-2xl font-bold text-opinion-agree leading-tight">
              {totalVotes ?? 0}
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              VOTES
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 border border-border p-4">
            <p className="text-2xl font-bold text-opinion-agree leading-tight">
              {totalTopics ?? 0}
            </p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              TOPICS
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
