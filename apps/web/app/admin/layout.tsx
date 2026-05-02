"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "./widgets/adminSidebar";

/**
 * 관리자 영역 공용 레이아웃.
 * - 권한 가드: 비로그인 → 로그인, 일반 사용자 → 홈으로 리다이렉트
 * - 사이드바 + children 2-컬럼 구조 (모바일은 상단 탭)
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        확인 중...
      </div>
    );
  }

  return (
    <div className="w-full px-5 py-4 md:py-6">
      <div className="flex flex-col md:flex-row md:gap-6">
        <AdminSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
