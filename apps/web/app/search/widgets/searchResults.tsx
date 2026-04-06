import { PostResponse } from "@chanban/shared-types";
import { SearchX } from "lucide-react";
import { TopicCard } from "@/app/topics/widgets/topicCard";
import { TopicsListSkeleton } from "@/app/topics/widgets/topicsListSkeleton";

interface SearchResultsProps {
  query: string;
  posts: PostResponse[];
  isLoading: boolean;
}

/**
 * 검색 결과 컴포넌트
 * - 로딩 중: TopicsListSkeleton
 * - 결과 있음: 결과 수 헤더 + TopicCard 목록
 * - 빈 상태: SearchX 안내 문구
 */
export function SearchResults({ query, posts, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return <TopicsListSkeleton />;
  }

  if (posts.length === 0) {
    return <SearchEmptyState query={query} />;
  }

  return (
    <div>
      <div className="px-5 pt-3 pb-1">
        <span className="text-[14px] font-bold">검색 결과</span>
        <span className="text-[14px] font-bold text-primary ml-1.5">{posts.length}건</span>
      </div>
      <div className="flex flex-col gap-3 px-3 pt-2 pb-3">
        {posts.map((post) => (
          <TopicCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center py-16 px-6 text-center">
      <SearchX className="w-10 h-10 text-muted-foreground/40 mb-3" />
      <p className="text-[15px] font-semibold mb-1">검색 결과가 없어요</p>
      <p className="text-[13px] text-muted-foreground">
        <span className="font-medium text-foreground">"{query}"</span>
        에 대한 토픽을 찾지 못했어요
      </p>
    </div>
  );
}
