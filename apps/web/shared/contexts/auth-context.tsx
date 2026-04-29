'use client';

import { LoginContent } from '@/app/auth/login/widgets/loginContent';
import { clearTokens, getAccessToken, getRefreshToken } from '@/lib/auth/token';
import { User } from '@/lib/auth/types';
import { httpClient } from '@/lib/httpClient';
import { ApiResponse, UserRole } from '@chanban/shared-types';
import { X } from 'lucide-react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  /**
   * 컴포넌트 마운트 시 현재 사용자 정보를 가져옵니다.
   */
  useEffect(() => {
    const loadUser = async () => {
      const token = getAccessToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await httpClient.get<ApiResponse<User>>('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load user:', error);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * 로그아웃 처리를 수행합니다.
   */
  const logout = async () => {
    const refreshToken = getRefreshToken();

    // 백엔드에 로그아웃 요청 (DB에서 refresh token 삭제)
    if (refreshToken) {
      try {
        await httpClient.post('/api/auth/logout', { refreshToken }, { skipAuth: true });
      } catch (error) {
        console.error('Logout request failed:', error);
        // 에러가 나도 로컬 토큰은 삭제
      }
    }

    // 로컬 스토리지에서 토큰 삭제
    clearTokens();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === UserRole.ADMIN,
    setUser,
    logout,
    openLoginModal,
    closeLoginModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isLoginModalOpen && <LoginModalOverlay onClose={closeLoginModal} />}
    </AuthContext.Provider>
  );
}

/**
 * 전역 로그인 모달 오버레이.
 * `@modal` intercepting route와 독립적으로, 어디서든 `openLoginModal()` 호출로 띄울 수 있다.
 */
function LoginModalOverlay({ onClose }: { onClose: () => void }) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-background rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <LoginContent onSuccess={onClose} />
      </div>
    </div>
  );
}

/**
 * Auth Context를 사용하기 위한 커스텀 훅
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
