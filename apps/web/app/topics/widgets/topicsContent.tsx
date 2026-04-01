import { PostTag } from "@chanban/shared-types";
import { topicDomains } from "../domains";
import { TopicCard } from "./topicCard";
import { TopicList } from "./topicList";

interface TopicsContentProps {
  selectedTag: PostTag | "all";
  selectedSort: "latest" | "popular";
}

/**
 * 토픽 목록 데이터를 fetch하고 렌더링하는 RSC.
 * Suspense 경계 내에서 사용되어 헤더와 독립적으로 스트리밍됩니다.
 */
export async function TopicsContent({
  selectedTag,
  selectedSort,
}: TopicsContentProps) {
  
  const initialPosts = await topicDomains.getPosts(
    selectedTag === "all" ? "all" : selectedTag,
    selectedSort
  );

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="divide-y divide-border/50">
        {initialPosts.data.map((post) => (
          <TopicCard key={post.id} post={post} />
        ))}
      </div>
      <TopicList
        tag={
          selectedTag === "all"
            ? selectedSort === "latest"
              ? "recent"
              : "hot"
            : selectedTag
        }
        initialMeta={initialPosts.meta}
      />
    </div>
  );
}
