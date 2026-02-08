"use client";

import { setTokens } from "@/lib/auth/token";
import { getAndClearReturnUrl } from "@/lib/auth/kakao";
import { AuthResponse } from "@/lib/auth/types";
import { httpClient } from "@/lib/httpClient";
import { useAuth } from "@/shared/contexts/auth-context";
import { ApiResponse } from "@chanban/shared-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKakaoCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("카카오 로그인에 실패했습니다.");
        return;
      }

      if (!code) {
        setError("인가 코드가 없습니다.");
        return;
      }

      try {
        const response = await httpClient
          .post<ApiResponse<AuthResponse>>(
            "/api/auth/kakao/login",
            { code },
            { skipAuth: true }
          )
          .then((res) => res.data);

        if (response.needsSignup) {
          // 신규 사용자: 회원가입 필요
          localStorage.setItem("tempToken", response.tempToken);
          router.push("/auth/signup");
        } else {
          // 기존 사용자: 로그인 완료
          setTokens(response.accessToken, response.refreshToken);
          setUser(response.user);

          // 저장된 URL로 돌아가기
          const returnUrl = getAndClearReturnUrl();
          router.push(returnUrl);
        }
      } catch (err) {
        console.error("Login failed:", err);
        setError("로그인 처리 중 오류가 발생했습니다.");
      }
    };

    handleKakaoCallback();
  }, [searchParams, router, setUser]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold text-destructive mb-4">로그인 실패</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => router.push("/auth/login")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
      <p className="text-muted-foreground">로그인 처리 중...</p>
    </div>
  );
}
