'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/auth/types';
import { getAccessToken, getRefreshToken, clearTokens } from '@/lib/auth/token';
import { httpClient } from '@/lib/httpClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        const userData = await httpClient.get<User>('/auth/me');
        setUser(userData);
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
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
