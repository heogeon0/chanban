import { PostTag } from "@chanban/shared-types";
import { Suspense } from "react";
import { topicDomains } from "./domains";
import { CategoryFilter } from "./widgets/categoryFilter";
import { TopicsContent } from "./widgets/topicsContent";
import { TopicsListSkeleton } from "./widgets/topicsListSkeleton";
import { TopicsCreateFab } from "./widgets/topicsCreateFab";

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: PostTag | "all"; sort?: string }>;
}) {
  const params = await searchParams;
  const { tag: selectedTag, sortType: selectedSort } =
    topicDomains.parseSortSearchParams(params);

  return (
    <>
      {/* 카테고리 필터 */}
      <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-5 py-2.5">
          <CategoryFilter selectedTag={selectedTag} selectedSort={selectedSort} />
        </div>
      </div>

      {/* 토픽 리스트 */}
      <Suspense fallback={<TopicsListSkeleton />}>
        <TopicsContent selectedTag={selectedTag} selectedSort={selectedSort} />
      </Suspense>

      {/* 글쓰기 FAB */}
      <TopicsCreateFab />
    </>
  );
}
