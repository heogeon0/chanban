"use client";

import { TopicCreateForm } from "@/app/topics/widgets/topicCreateForm";

/**
 * 관리자 전용 공식 투표 작성 페이지.
 * 권한 가드는 `/admin/layout.tsx`에서 일괄 처리한다.
 */
export default function AdminCreateOfficialPostPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-4">
        <h1 className="text-xl font-bold">공식 투표 작성</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          관리자 권한으로 작성된 공식 투표는 메인 피드에 노출됩니다.
        </p>
      </header>
      <TopicCreateForm variant="official" />
    </div>
  );
}
