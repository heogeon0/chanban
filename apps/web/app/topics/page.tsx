import {
  PostTag
} from "@chanban/shared-types";
import Link from "next/link";
import ListToggle from "./_components/listToggle";
import { TopicCard } from "./_components/topicCard";
import { TopicList } from "./_components/topicList";
import { CATEGORY_FILTERS } from "./_constants";
import { topicDomains } from "./_domains";





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
          <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_FILTERS.map((category) => {
              const isActive =
                selectedTag === category.id ||
                (category.id === "all" && selectedTag === "all");
              return (
                <Link
                  key={category.id}
                  href={`/topics?tag=${category.id}&sort=${selectedSort}`}
                  className={`px-3 desktop:px-4 py-1.5 desktop:py-2 rounded-full text-xs desktop:text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 토픽 목록 */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full px-0 desktop:px-8 desktop:py-6">
          {/* 모바일: divide-y, 데스크탑: 카드 간격 */}
          <div className="divide-y divide-border/50 desktop:divide-y-0 desktop:space-y-0">
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
