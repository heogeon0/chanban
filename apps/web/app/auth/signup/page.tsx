'use client';

import { setTokens } from '@/lib/auth/token';
import { httpClient } from '@/lib/httpClient';
import { useAuth } from '@/shared/contexts/auth-context';
import { ApiResponse } from '@chanban/shared-types';
import { Button } from '@workspace/ui/components/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    nickname: string;
    profileImageUrl: string | null;
  };
}

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 임시 토큰이 없으면 로그인 페이지로 리다이렉트
    const tempToken = localStorage.getItem('tempToken');
    if (!tempToken) {
      router.push('/auth/login');
    }
  }, [router]);

  /**
   * 닉네임 유효성 검증
   */
  const validateNickname = (value: string): string | null => {
    if (value.length < 2) {
      return '닉네임은 최소 2자 이상이어야 합니다.';
    }
    if (value.length > 20) {
      return '닉네임은 최대 20자까지 가능합니다.';
    }
    return null;
  };

  /**
   * 회원가입 처리
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 닉네임 유효성 검증
    const validationError = validateNickname(nickname);
    if (validationError) {
      setError(validationError);
      return;
    }

    const tempToken = localStorage.getItem('tempToken');
    if (!tempToken) {
      setError('임시 토큰이 없습니다. 다시 로그인해주세요.');
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);

    try {
      // 회원가입 API 호출
      const response = await httpClient.post<ApiResponse<SignupResponse>>(
        '/api/auth/signup',
        {
          tempToken,
          nickname: nickname.trim(),
        },
        { skipAuth: true }
      ).then((res) => res.data);

      // 임시 토큰 삭제
      localStorage.removeItem('tempToken');

      // 토큰 저장
      setTokens(response.accessToken, response.refreshToken);

      // 사용자 정보 저장
      setUser(response.user);

      // 메인 페이지로 리다이렉트
      router.push('/topics');
    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(
        err?.message || '회원가입 처리 중 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">회원가입</h1>
          <p className="text-gray-600">닉네임을 입력해주세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700"
            >
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="2~20자 이내로 입력해주세요"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || !nickname.trim()}
            className="w-full"
          >
            {isLoading ? '처리 중...' : '회원가입 완료'}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('tempToken');
              router.push('/auth/login');
            }}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
