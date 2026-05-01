"use client";

import { TrendingUp } from "lucide-react";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { topicQueries } from "@/shared/queries/topic";
import { TopicCard } from "@/app/topics/widgets/topicCard";
import { useRecentSearches } from "../features/use-recent-searches";
import { useSearchTopics } from "../features/use-search-topics";
import { RecentSearches } from "./recentSearches";
import { SearchBar } from "./searchBar";
import { SearchResults } from "./searchResults";

type SearchType = "all" | "content" | "author";

/**
 * 검색 페이지 클라이언트 컴포넌트
 * - query 없음: 최근 검색 기록 + 인기 토픽 피드
 * - query 있음: SearchResults
 */
export function SearchContent() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");

  const { data: hotData } = useQuery(topicQueries.list("hot", 1));
  const hotPosts = hotData?.data ?? [];
  const { addSearch } = useRecentSearches();
  const { data, isLoading, isError, refetch } = useSearchTopics(query, searchType);

  const handleQueryChange = useCallback((q: string, type: SearchType) => {
    setQuery(q);
    setSearchType(type);
    if (q.trim()) addSearch(q.trim());
  }, [addSearch]);

  // SearchBar의 value prop으로 전달 → SearchBar가 onQueryChange를 통해 addSearch까지 처리
  const handleRecentSelect = useCallback((q: string) => {
    setQuery(q);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <SearchBar value={query} onQueryChange={handleQueryChange} />
      </div>

      {query ? (
        <SearchResults
          query={query}
          total={data?.meta.total}
          posts={data?.data ?? []}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
        />
      ) : (
        <div>
          {/* 최근 검색 기록 */}
          <RecentSearches onSelect={handleRecentSelect} />

          {/* 인기 토픽 */}
          <div className="px-5 pt-4 pb-1 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[14px] font-bold">지금 인기 토픽</span>
          </div>
          <div className="flex flex-col gap-3 px-3 pt-2 pb-3">
            {hotPosts.map((post) => (
              <TopicCard key={post.id} post={post} />
            ))}
          </div>

          {/* TODO: 반대가 많은 주제 섹션
            - disagreeCount 높은 순 정렬
            - API: GET /api/posts/recent?sort=disagree&limit=5
          */}

          {/* TODO: 찬성이 많은 주제 섹션
            - agreeCount 높은 순 정렬
            - API: GET /api/posts/recent?sort=agree&limit=5
          */}

          {/* TODO: 관심이 급격히 늘어난 주제 섹션 (트렌딩)
            - 최근 N시간 내 투표/댓글 증가율 기반
            - 별도 API 엔드포인트 필요: GET /api/posts/trending
          */}
        </div>
      )}
    </div>
  );
}
