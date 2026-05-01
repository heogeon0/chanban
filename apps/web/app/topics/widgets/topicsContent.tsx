import { PostTag } from "@chanban/shared-types";
import { Flame, Clock, TrendingUp } from "lucide-react";
import { topicDomains } from "../domains";
import { TopicCard } from "./topicCard";
import { TopicList } from "./topicList";

interface TopicsContentProps {
  selectedTag: PostTag | "all";
  selectedSort: "latest" | "popular";
}

/**
 * 토픽 목록 데이터를 fetch하고 렌더링하는 RSC.
 * - 전체 탭: 인기순 피드
 * - 카테고리 탭: HOT 3개 상단 고정 + 최신순 피드
 */
export async function TopicsContent({
  selectedTag,
}: TopicsContentProps) {

  // 전체 탭: 인기순 고정
  if (selectedTag === "all") {
    const initialPosts = await topicDomains.getAllPosts();
    return (
      <div>
        <div className="px-5 pt-3 pb-1 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-[14px] font-bold">인기 토픽</span>
        </div>
        <div className="flex flex-col gap-3 px-3 pt-2 pb-3">
          {initialPosts.data.map((post) => (
            <TopicCard key={post.id} post={post} />
          ))}
        </div>
        <TopicList tag="hot" initialPage={initialPosts} />
      </div>
    );
  }

  // 카테고리 탭: HOT 3개 + 최신순
  const [hotPosts, latestPosts] = await Promise.all([
    topicDomains.getHotPostsByTag(selectedTag, 3),
    topicDomains.getLatestPostsByTag(selectedTag),
  ]);

  const hotIds = hotPosts.data.map((p) => p.id);
  const filteredLatest = latestPosts.data.filter((p) => !hotIds.includes(p.id));

  return (
    <div>
      {/* HOT 섹션 */}
      {hotPosts.data.length > 0 && (
        <>
          <div className="px-5 pt-3 pb-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-500" />
            <span className="text-[14px] font-bold">인기</span>
          </div>
          <div className="flex flex-col gap-3 px-3 pb-2">
            {hotPosts.data.map((post) => (
              <TopicCard key={post.id} post={post} isHot />
            ))}
          </div>
        </>
      )}

      {/* 최신 섹션 */}
      <div className="px-5 pt-3 pb-1 flex items-center gap-1.5">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-[14px] font-bold">최신</span>
      </div>
      <div className="flex flex-col gap-3 px-3 pb-2">
        {filteredLatest.map((post) => (
          <TopicCard key={post.id} post={post} />
        ))}
      </div>
      <TopicList tag={selectedTag} initialPage={latestPosts} excludeIds={hotIds} />
    </div>
  );
}
