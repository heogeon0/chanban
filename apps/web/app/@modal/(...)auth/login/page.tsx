"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { LoginContent } from "@/app/auth/login/widgets/loginContent";

/**
 * 로그인 모달 컴포넌트
 * Intercepting Route를 통해 앱 내 네비게이션 시 모달로 표시됩니다.
 */
export default function LoginModal() {
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

        {/* 로그인 콘텐츠 */}
        <LoginContent onSuccess={handleClose} />
      </div>
    </div>
  );
}
