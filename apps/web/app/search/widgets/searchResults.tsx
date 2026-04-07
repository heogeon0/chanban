import { PostResponse } from "@chanban/shared-types";
import { AlertCircle, SearchX } from "lucide-react";
import { TopicCard } from "@/app/topics/widgets/topicCard";
import { TopicsListSkeleton } from "@/app/topics/widgets/topicsListSkeleton";

interface SearchResultsProps {
  query: string;
  posts: PostResponse[];
  isLoading: boolean;
  isError: boolean;
  total?: number;
  onRetry: () => void;
}

/**
 * 검색 결과 컴포넌트
 * - 로딩: TopicsListSkeleton
 * - 에러: AlertCircle + 재시도 버튼
 * - 결과 있음: "검색 결과 · N건" 헤더 + TopicCard 목록
 * - 빈 상태: SearchX 안내 문구
 */
export function SearchResults({
  query,
  posts,
  isLoading,
  isError,
  total,
  onRetry,
}: SearchResultsProps) {
  if (isLoading) {
    return <TopicsListSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-16 px-6 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-[15px] font-semibold mb-1">검색 중 오류가 발생했어요</p>
        <p className="text-[13px] text-muted-foreground mb-4">잠시 후 다시 시도해주세요</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
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

  return (
    <div>
      <div className="px-5 pt-3 pb-1 flex items-center gap-1.5">
        <span className="text-[14px] font-bold">
          <span className="text-muted-foreground font-medium">"{query}"</span>
          {" "}검색 결과
        </span>
        {total !== undefined && (
          <span className="text-[14px] font-bold text-primary">{total}건</span>
        )}
      </div>
      <div className="flex flex-col gap-3 px-3 pt-2 pb-3">
        {posts.map((post) => (
          <TopicCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
