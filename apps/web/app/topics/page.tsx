import { PostTag } from "@chanban/shared-types";
import type { Metadata } from "next";
import { Suspense } from "react";
import { topicDomains } from "./domains";
import { TAG_MAP } from "./domains/constants";
import { CategoryFilter } from "./widgets/categoryFilter";
import ListToggle from "./widgets/listToggle";
import { TopicsContent } from "./widgets/topicsContent";
import { TopicsListSkeleton } from "./widgets/topicsListSkeleton";

/**
 * 선택된 tag에 따라 동적 메타데이터를 생성합니다.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tag?: PostTag | "all"; sort?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const { tag: selectedTag } = topicDomains.parseSortSearchParams(params);

  if (selectedTag === "all") {
    return {
      title: "토픽",
      description: "사회, 정치, 경제, 기술 등 다양한 주제의 찬반 토론을 확인하세요.",
    };
  }

  const tagInfo = TAG_MAP[selectedTag];
  return {
    title: `${tagInfo.name} 토픽`,
    description: `${tagInfo.name} 분야의 찬반 토론을 확인하세요.`,
  };
}

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: PostTag | "all"; sort?: string }>;
}) {
  const params = await searchParams;
  const { tag: selectedTag, sortType: selectedSort } =
    topicDomains.parseSortSearchParams(params);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 섹션 — 데이터 불필요, 즉시 렌더링 */}
      <div className="p-4 desktop:px-8 desktop:py-6 space-y-4 border-b border-border">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg desktop:text-2xl font-bold">토픽</h1>
            <ListToggle selectedTag={selectedTag} selectedSort={selectedSort} />
          </div>
          <CategoryFilter selectedTag={selectedTag} selectedSort={selectedSort} />
        </div>
      </div>

      {/* 토픽 목록 — API 응답 대기 중 스켈레톤 표시 */}
      <section className="flex-1 overflow-y-auto">
        <Suspense fallback={<TopicsListSkeleton />}>
          <TopicsContent
            selectedTag={selectedTag}
            selectedSort={selectedSort}
          />
        </Suspense>
      </section>
    </div>
  );
}
