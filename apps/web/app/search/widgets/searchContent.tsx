"use client";

import { PostResponse } from "@chanban/shared-types";
import { TrendingUp } from "lucide-react";
import { useCallback, useState } from "react";
import { TopicCard } from "@/app/topics/widgets/topicCard";
import { useSearchTopics } from "../features/use-search-topics";
import { SearchBar } from "./searchBar";
import { SearchResults } from "./searchResults";

type SearchType = "all" | "content" | "author";

interface SearchContentProps {
  hotPosts: PostResponse[];
}

/**
 * 검색 페이지 클라이언트 컴포넌트
 * - query 없음: 서버에서 받은 인기 토픽 피드 표시
 * - query 있음: SearchResults 표시
 */
export function SearchContent({ hotPosts }: SearchContentProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");

  const handleQueryChange = useCallback((q: string, type: SearchType) => {
    setQuery(q);
    setSearchType(type);
  }, []);

  const { data, isLoading } = useSearchTopics(query, searchType);

  return (
    <div className="flex flex-col">
      <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <SearchBar onQueryChange={handleQueryChange} />
      </div>

      {query ? (
        <SearchResults
          query={query}
          posts={data?.data ?? []}
          isLoading={isLoading}
        />
      ) : (
        <div>
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
