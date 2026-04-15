"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * 커뮤니티 토픽 작성 진입용 FAB (`/topics` 페이지 우하단 고정)
 * 비로그인 시 로그인 페이지로 이동
 */
export function TopicsCreateFab() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => router.push("/auth/login?returnUrl=/topics")}
        aria-label="토픽 작성"
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Link
      href="/topics/create"
      aria-label="토픽 작성"
      className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity z-40"
    >
      <Plus className="w-6 h-6" />
    </Link>
  );
}
