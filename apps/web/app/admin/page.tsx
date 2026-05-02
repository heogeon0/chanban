"use client";

import { Button } from "@/shared/ui/button";
import { ListChecks, PenSquare } from "lucide-react";
import Link from "next/link";
import { RecentOfficialPostsPreview } from "./widgets/recentOfficialPostsPreview";

/**
 * 어드민 대시보드 메인.
 * - 작성 CTA
 * - 최근 공식 토론 미리보기
 */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">어드민 대시보드</h1>
        <p className="text-sm text-muted-foreground">
          공식 토론을 작성하고 관리하세요.
        </p>
      </header>

      <section className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg" className="sm:w-auto">
          <Link href="/admin/posts/create">
            <PenSquare className="w-4 h-4 mr-2" />
            공식 토론 작성하기
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/admin/posts">
            <ListChecks className="w-4 h-4 mr-2" />
            전체 목록 보기
          </Link>
        </Button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">최근 공식 토론</h2>
          <Link
            href="/admin/posts"
            className="text-xs font-medium text-primary hover:underline"
          >
            전체 보기 →
          </Link>
        </div>
        <RecentOfficialPostsPreview />
      </section>
    </div>
  );
}
