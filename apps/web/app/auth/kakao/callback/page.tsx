'use client';

import { setTokens } from '@/lib/auth/token';
import { AuthResponse } from '@/lib/auth/types';
import { httpClient } from '@/lib/httpClient';
import { useAuth } from '@/shared/contexts/auth-context';
import { ApiResponse } from '@chanban/shared-types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKakaoCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('카카오 로그인에 실패했습니다.');
        return;
      }

      if (!code) {
        setError('인가 코드가 없습니다.');
        return;
      }

      try {
        // 백엔드로 인가 코드 전송
        const response = await httpClient.post<ApiResponse<AuthResponse>>(
          '/api/auth/kakao/login',
          { code },
          { skipAuth: true }
        ).then((res) => res.data);

        // 회원가입 필요 여부에 따라 분기 처리
        if (response.needsSignup) {
          // 신규 사용자: 임시 토큰 저장 후 회원가입 페이지로 이동
          localStorage.setItem('tempToken', response.tempToken);
          router.push('/auth/signup');
        } else {
          // 기존 사용자: 토큰 저장 후 메인 페이지로 이동
          setTokens(response.accessToken, response.refreshToken);
          setUser(response.user);
          router.push('/topics');
        }
      } catch (err) {
        console.error('Login failed:', err);
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    };

    handleKakaoCallback();
  }, [searchParams, router, setUser]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold text-red-600 mb-4">로그인 실패</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => router.push('/auth/login')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4" />
      <p className="text-gray-600">로그인 처리 중...</p>
    </div>
  );
}
