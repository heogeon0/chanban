import { PostTag } from "@chanban/shared-types";
import { Suspense } from "react";
import { HotTopicsSection } from "./feed/widgets/hotTopicsSection";
import { topicDomains } from "./topics/domains";
import { CategoryFilter } from "./topics/widgets/categoryFilter";
import ListToggle from "./topics/widgets/listToggle";
import { TopicsContent } from "./topics/widgets/topicsContent";
import { TopicsListSkeleton } from "./topics/widgets/topicsListSkeleton";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: PostTag | "all"; sort?: string }>;
}) {
  const params = await searchParams;
  const { tag: selectedTag, sortType: selectedSort } =
    topicDomains.parseSortSearchParams(params);

  return (
    <>
      {/* 인기 토픽 */}
      <div className="bg-muted/40 border-b border-border">
        <HotTopicsSection />
      </div>

      {/* 필터 바 */}
      <div className="sticky top-14 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <CategoryFilter selectedTag={selectedTag} selectedSort={selectedSort} />
          <ListToggle selectedTag={selectedTag} selectedSort={selectedSort} />
        </div>
      </div>

      {/* 토픽 리스트 */}
      <Suspense fallback={<TopicsListSkeleton />}>
        <TopicsContent selectedTag={selectedTag} selectedSort={selectedSort} />
      </Suspense>
    </>
  );
}
