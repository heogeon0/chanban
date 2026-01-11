'use client';

import { useAuth } from '../contexts/auth-context';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';

/**
 * 사용자 메뉴 컴포넌트
 * 로그인 상태에 따라 로그인 버튼 또는 사용자 정보와 로그아웃 버튼을 표시합니다.
 */
export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">로그인</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{user?.nickname}</span>
      <Button onClick={logout} size="sm" variant="outline">
        로그아웃
      </Button>
    </div>
  );
}
