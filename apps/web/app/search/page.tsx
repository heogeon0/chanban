import { Suspense } from "react";
import { TrendingUp } from "lucide-react";
import { topicDomains } from "@/app/topics/domains";
import { TopicCard } from "@/app/topics/widgets/topicCard";
import { TopicsListSkeleton } from "@/app/topics/widgets/topicsListSkeleton";
import { SearchBar } from "./widgets/searchBar";
import { CategoryGrid } from "./widgets/categoryGrid";

/**
 * 탐색 페이지
 * - 카테고리 그리드로 주제별 탐색
 * - 실시간 인기 토픽 피드
 */
export default async function SearchPage() {
  return (
    <div className="flex flex-col">
      {/* 검색바 */}
      <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <SearchBar />
      </div>

      <div className="px-4 pt-5 pb-4">
        {/* 카테고리 탐색 */}
        <h2 className="text-[14px] font-bold mb-3">카테고리 탐색</h2>
        <CategoryGrid />
      </div>

      {/* 인기 토픽 */}
      <div>
        <div className="px-5 pt-2 pb-1 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-[14px] font-bold">지금 인기 토픽</span>
        </div>
        <Suspense fallback={<TopicsListSkeleton />}>
          <HotTopicsFeed />
        </Suspense>
      </div>
    </div>
  );
}

async function HotTopicsFeed() {
  const posts = await topicDomains.getAllPosts();

  return (
    <div className="flex flex-col gap-3 px-3 pt-2 pb-3">
      {posts.data.map((post) => (
        <TopicCard key={post.id} post={post} />
      ))}
    </div>
  );
}
