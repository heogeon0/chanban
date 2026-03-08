'use client';

import { ProtectedRoute } from '@/shared/components/protected-route';
import { userQueries } from '@/shared/queries';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { MyTopicsTab } from './widgets/myTopicsTab';
import { MyVotesTab } from './widgets/myVotesTab';
import { ProfileSection } from './widgets/profileSection';

type TabType = 'votes' | 'topics';

/**
 * 마이페이지
 * 내 프로필(통계 포함), 내 투표, 내 토픽을 탭으로 구분하여 표시합니다.
 */
export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('votes');

  // 프로필 통계용 첫 페이지 쿼리 (meta.total 활용)
  const { data: votesData } = useQuery(userQueries.myVotes(1));
  const { data: postsData } = useQuery(userQueries.myPosts(1));

  const totalVotes = votesData?.meta.total;
  const totalTopics = postsData?.meta.total;

  return (
    <ProtectedRoute redirectTo="/auth/login?returnUrl=/my">
      <div className="max-w-6xl mx-auto w-full">
        <ProfileSection totalVotes={totalVotes} totalTopics={totalTopics} />

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('votes')}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'votes'
                ? 'border-opinion-agree text-opinion-agree'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            내 투표 목록
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'topics'
                ? 'border-opinion-agree text-opinion-agree'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            내 토픽 목록
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'votes' ? <MyVotesTab /> : <MyTopicsTab />}
      </div>
    </ProtectedRoute>
  );
}
