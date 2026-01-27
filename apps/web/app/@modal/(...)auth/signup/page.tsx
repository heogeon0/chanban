"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { SignupContent } from "@/app/auth/signup/_components/signupContent";

/**
 * 회원가입 모달 컴포넌트
 * Intercepting Route를 통해 앱 내 네비게이션 시 모달로 표시됩니다.
 */
export default function SignupModal() {
  const router = useRouter();

  /**
   * 모달 닫기 핸들러
   */
  const handleClose = () => {
    router.back();
  };

  /**
   * 백드롭 클릭 핸들러
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  /**
   * 로그인 페이지로 돌아가기 (모달 내에서)
   */
  const handleBackToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-background rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* 회원가입 콘텐츠 */}
        <SignupContent
          onSuccess={handleClose}
          onBackToLogin={handleBackToLogin}
        />
      </div>
    </div>
  );
}
