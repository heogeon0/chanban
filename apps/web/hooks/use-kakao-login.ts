'use client';

import { useEffect } from 'react';
import { initKakao, loginWithKakao } from '@/lib/auth/kakao';

/**
 * 카카오 로그인 기능을 제공하는 커스텀 훅
 */
export const useKakaoLogin = () => {
  useEffect(() => {
    initKakao();
  }, []);

  return {
    loginWithKakao,
  };
};
