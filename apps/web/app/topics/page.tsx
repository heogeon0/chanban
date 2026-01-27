import { PostTag } from "@chanban/shared-types";
import { CategoryFilter } from "./widgets/categoryFilter";
import ListToggle from "./widgets/listToggle";
import { TopicCard } from "./widgets/topicCard";
import { TopicList } from "./widgets/topicList";
import { topicDomains } from "./domains";



export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: PostTag | "all"; sort?: string }>;
}) {
  const params = await searchParams;
  const { tag: selectedTag, sortType: selectedSort } =
    topicDomains.parseSortSearchParams(params);

  const initialPosts = await topicDomains.getPosts(
    selectedTag === "all" ? "all" : selectedTag,
    selectedSort
  );
  

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 섹션 */}
      <div className="p-4 desktop:px-8 desktop:py-6 space-y-4 border-b border-border">
        <div className="max-w-4xl mx-auto w-full">
          {/* 타이틀 & 정렬 탭 */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg desktop:text-2xl font-bold">토픽</h1>
            <ListToggle selectedTag={selectedTag} selectedSort={selectedSort} />
          </div>

          {/* 카테고리 필터 */}
          <CategoryFilter selectedTag={selectedTag} selectedSort={selectedSort} />
        </div>
      </div>

      {/* 토픽 목록 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full px-0 desktop:px-8 desktop:py-6">
          {/* 모바일: divide-y, 데스크탑: 카드 간격 */}
          <div className="divide-y divide-border/50 space-y-1 desktop:divide-y-0 desktop:space-y-0">
            {initialPosts.data.map((post) => (
              <TopicCard key={post.id} post={post} />
            ))}
          </div>
          {/* 무한스크롤 */}
          <TopicList
            tag={selectedTag === "all" ? "hot" : selectedTag}
            initialMeta={initialPosts.meta}
          />
        </div>
      </main>
    </div>
  );
}
