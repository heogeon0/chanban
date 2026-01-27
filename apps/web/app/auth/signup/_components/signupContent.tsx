"use client";

import { setTokens } from "@/lib/auth/token";
import { httpClient } from "@/lib/httpClient";
import { useAuth } from "@/shared/contexts/auth-context";
import { ApiResponse } from "@chanban/shared-types";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    nickname: string;
    profileImageUrl: string | null;
  };
}

interface SignupContentProps {
  /** 회원가입 성공 시 호출될 콜백 */
  onSuccess?: () => void;
  /** 로그인 페이지로 돌아갈 때 호출될 콜백 */
  onBackToLogin?: () => void;
}

/**
 * 회원가입 콘텐츠 컴포넌트
 * 회원가입 페이지와 모달에서 공통으로 사용됩니다.
 */
export function SignupContent({ onSuccess, onBackToLogin }: SignupContentProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasTempToken, setHasTempToken] = useState(true);

  useEffect(() => {
    // 임시 토큰이 없으면 로그인 페이지로 리다이렉트
    const tempToken = localStorage.getItem("tempToken");
    if (!tempToken) {
      setHasTempToken(false);
      if (onBackToLogin) {
        onBackToLogin();
      } else {
        router.push("/auth/login");
      }
    }
  }, [router, onBackToLogin]);

  /**
   * 닉네임 유효성 검증
   */
  const validateNickname = (value: string): string | null => {
    if (value.length < 2) {
      return "닉네임은 최소 2자 이상이어야 합니다.";
    }
    if (value.length > 20) {
      return "닉네임은 최대 20자까지 가능합니다.";
    }
    return null;
  };

  /**
   * 회원가입 처리
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateNickname(nickname);
    if (validationError) {
      setError(validationError);
      return;
    }

    const tempToken = localStorage.getItem("tempToken");
    if (!tempToken) {
      setError("임시 토큰이 없습니다. 다시 로그인해주세요.");
      if (onBackToLogin) {
        onBackToLogin();
      } else {
        router.push("/auth/login");
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await httpClient
        .post<ApiResponse<SignupResponse>>(
          "/api/auth/signup",
          {
            tempToken,
            nickname: nickname.trim(),
          },
          { skipAuth: true }
        )
        .then((res) => res.data);

      // 임시 토큰 삭제
      localStorage.removeItem("tempToken");

      // 토큰 저장
      setTokens(response.accessToken, response.refreshToken);

      // 사용자 정보 저장
      setUser(response.user);

      // 성공 콜백 또는 메인 페이지로 이동
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/topics");
      }
    } catch (err: unknown) {
      console.error("Signup failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "회원가입 처리 중 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 로그인 페이지로 돌아가기
   */
  const handleBackToLogin = () => {
    localStorage.removeItem("tempToken");
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      router.push("/auth/login");
    }
  };

  if (!hasTempToken) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">회원가입</h1>
        <p className="text-muted-foreground">닉네임을 입력해주세요</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="nickname"
            className="block text-sm font-medium"
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
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !nickname.trim()}
          className="w-full"
        >
          {isLoading ? "처리 중..." : "회원가입 완료"}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleBackToLogin}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}
