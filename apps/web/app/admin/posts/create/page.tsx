"use client";

import { TopicCreateForm } from "@/app/topics/widgets/topicCreateForm";
import { useAuth } from "@/shared/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 관리자 전용 공식 투표 작성 페이지
 * 비관리자는 메인으로 리다이렉트
 */
export default function AdminCreateOfficialPostPage() {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth/login?returnUrl=/admin/posts/create");
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isAuthenticated, isLoading, router]);

  if (isLoading || !isAdmin) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        확인 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4">
        <header className="mb-4">
          <h1 className="text-xl font-bold">공식 투표 작성</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            관리자 권한으로 작성된 공식 투표는 메인 피드에 노출됩니다.
          </p>
        </header>
        <TopicCreateForm variant="official" />
      </div>
    </div>
  );
}
