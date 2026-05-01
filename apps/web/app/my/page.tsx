'use client';

import { ProtectedRoute } from '@/shared/components/protected-route';
import { userQueries } from '@/shared/queries';
import { useAuth } from '@/shared/contexts/auth-context';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { MyTopicsTab } from './widgets/myTopicsTab';
import { MyVotesTab } from './widgets/myVotesTab';
import { MyCommentsTab } from './widgets/myCommentsTab';
import { ProfileSection } from './widgets/profileSection';
import { FollowListSheet } from './widgets/follow-list-sheet';

type TabType = 'votes' | 'comments' | 'topics';

const TABS: { id: TabType; label: string }[] = [
  { id: 'votes', label: '내 투표' },
  { id: 'comments', label: '내 의견' },
  { id: 'topics', label: '내 토픽' },
];

/**
 * 마이페이지
 * 내 프로필(통계 포함), 내 투표, 내 의견, 내 토픽을 탭으로 구분하여 표시합니다.
 */
export default function MyPage() {
  const [activeTab, setActiveTab] = useState<TabType>('votes');
  const [followSheet, setFollowSheet] = useState<'followers' | 'following' | null>(null);
  const { user, isAdmin } = useAuth();

  const { data: votesData } = useQuery(userQueries.myVotes(1));
  const { data: postsData } = useQuery(userQueries.myPosts(1));
  const { data: commentsData } = useQuery({
    ...userQueries.userComments(user?.id ?? '', 1),
    enabled: !!user?.id,
  });

  const totalVotes = votesData?.meta.total;
  const totalTopics = postsData?.meta.total;
  const totalComments = commentsData?.meta.total;

  return (
    <ProtectedRoute redirectTo="/auth/login?returnUrl=/my">
      <div className="max-w-4xl mx-auto w-full">
        <ProfileSection
          totalVotes={totalVotes}
          totalTopics={totalTopics}
          totalComments={totalComments}
          onFollowSheetOpen={setFollowSheet}
        />

        {isAdmin && (
          <Link
            href="/admin/posts/create"
            className="mx-4 mb-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            공식 투표 작성
          </Link>
        )}

        <div>
          {/* 탭 네비게이션 */}
          <div className="flex border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-opinion-agree text-opinion-agree'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 컨텐츠 */}
          {activeTab === 'votes' && <MyVotesTab />}
          {activeTab === 'comments' && <MyCommentsTab />}
          {activeTab === 'topics' && <MyTopicsTab />}

          {user?.id && (
            <FollowListSheet
              userId={user.id}
              type={followSheet}
              onClose={() => setFollowSheet(null)}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
