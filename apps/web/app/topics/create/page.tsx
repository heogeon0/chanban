"use client";

import { TopicCreateForm } from "../_components/topicCreateForm";

/**
 * 토픽 작성 페이지
 * 새로운 토픽을 작성하는 페이지입니다.
 */
export default function CreateTopicPage() {
  console.log('develop 환경 배포')
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-title-default font-semibold">새 토픽 작성</h1>
        <div className="w-12" /> {/* 중앙 정렬용 spacer */}
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-3xl mx-auto p-4">
        <TopicCreateForm />
      </main>
    </div>
  );
}
