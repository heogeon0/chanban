'use client';

import { Button } from '@/shared/ui/button';
import { useKakaoLogin } from '@/hooks/use-kakao-login';

export function KakaoLoginButton() {
  const { loginWithKakao } = useKakaoLogin();

  return (
    <Button
      onClick={loginWithKakao}
      className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-black"
    >
      <svg
        className="w-5 h-5 mr-2"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3Z" />
      </svg>
      카카오 로그인
    </Button>
  );
}
