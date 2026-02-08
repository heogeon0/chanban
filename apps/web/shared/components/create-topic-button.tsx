"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { Button } from "@/shared/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * 새 토론 작성 버튼 컴포넌트
 * 로그인 상태에 따라 토론 작성 페이지 또는 로그인 페이지로 이동합니다.
 */
export function CreateTopicButton() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/auth/login");
    }
  };

  return (
    <Button asChild size="sm" className="gap-2">
      <Link href="/topics/create" onClick={handleClick}>
        <PlusCircle className="w-4 h-4" />
        <span className="hidden desktop:inline">새 토론</span>
      </Link>
    </Button>
  );
}
