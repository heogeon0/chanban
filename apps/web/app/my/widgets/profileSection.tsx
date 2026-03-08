'use client';

import { useAuth } from '@/shared/contexts/auth-context';
import { UserAvatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { useState } from 'react';
import { EditNicknameForm } from './editNicknameForm';

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

  const hasStats = totalVotes !== undefined || totalTopics !== undefined;

  return (
    <div className="px-4 py-8 desktop:px-8 desktop:py-10 border-b border-border">
      {/* 모바일: 중앙 정렬 컬럼 / 데스크탑: 수평 row */}
      <div className="flex flex-col items-center gap-4 desktop:flex-row desktop:items-end desktop:justify-between">
        {/* 아바타 + 정보 */}
        <div className="flex flex-col items-center gap-3 desktop:flex-row desktop:items-center desktop:gap-6">
          <UserAvatar
            user={user}
            size="md"
            className="size-24 desktop:size-28 text-2xl rounded-full ring-4 ring-primary/20"
          />
          <div className="flex flex-col items-center gap-1 desktop:items-start">
            <p className="text-2xl desktop:text-3xl font-bold leading-tight">
              {user?.nickname}
            </p>
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

        {/* 수정 버튼 / 폼 */}
        <div className="w-full desktop:w-auto">
          {isEditing ? (
            <EditNicknameForm
              currentNickname={user?.nickname ?? ''}
              onClose={() => setIsEditing(false)}
            />
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full desktop:w-auto rounded-full desktop:rounded-lg gap-1.5"
            >
              <span className="text-sm">✏</span>
              Edit Profile
            </Button>
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
