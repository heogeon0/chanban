'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RETURN_URL_KEY } from '@/lib/auth/kakao';

/**
 * 사용자 메뉴 컴포넌트
 * 로그인 상태에 따라 로그인 버튼 또는 프로필 사진과 드롭다운 메뉴를 표시합니다.
 */
export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /**
   * 외부 클릭 시 드롭다운 닫기
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  /**
   * 로그아웃 처리
   */
  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push('/auth/login');
  };

  /**
   * 로그인 링크 클릭 시 현재 URL 저장
   */
  const handleLoginClick = () => {
    localStorage.setItem(RETURN_URL_KEY, window.location.href);
  };

  if (!isAuthenticated) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login" onClick={handleLoginClick}>
          로그인
        </Link>
      </Button>
    );
  }

  /**
   * 닉네임의 첫 글자를 추출 (프로필 이미지 fallback용)
   */
  const getInitial = (nickname: string) => {
    return nickname.charAt(0).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 프로필 사진 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="사용자 메뉴"
      >
        <Avatar className="w-8 h-8 cursor-pointer">
          {user?.profileImageUrl && (
            <AvatarImage
              src={user.profileImageUrl}
              alt={user.nickname}
            />
          )}
          <AvatarFallback className="bg-blue-500 text-white text-sm">
            {user?.nickname ? getInitial(user.nickname) : '?'}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {/* 사용자 정보 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user?.nickname}
              </p>
            </div>

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
