"use client";

import { KakaoLoginButton } from "@/shared/components/kakao-login-button";
import { useAuth } from "@/shared/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface LoginContentProps {
  /** 로그인 성공 시 호출될 콜백 (모달에서는 router.back(), 페이지에서는 router.push) */
  onSuccess?: () => void;
}

/**
 * 로그인 콘텐츠 컴포넌트
 * 로그인 페이지와 모달에서 공통으로 사용됩니다.
 */
export function LoginContent({ onSuccess }: LoginContentProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // 이미 로그인된 경우 처리
  useEffect(() => {
    if (isAuthenticated) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/topics");
      }
    }
  }, [isAuthenticated, router, onSuccess]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">찬반</h1>
        <p className="text-muted-foreground">로그인하고 주제에 투표해보세요</p>
      </div>

      <div className="space-y-4">
        <KakaoLoginButton />
      </div>
    </div>
  );
}
