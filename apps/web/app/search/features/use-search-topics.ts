"use client";

import { topicQueries } from "@/shared/queries/topic";
import { useQuery } from "@tanstack/react-query";

type SearchType = "all" | "content" | "author";

/**
 * 텍스트 검색 훅
 * @param q - 검색 키워드 (빈 문자열이면 쿼리 비활성화)
 * @param type - 검색 범위, 기본 'all'
 */
export function useSearchTopics(q: string, type: SearchType = "all") {
  return useQuery({
    ...topicQueries.search(q, type),
    enabled: q.trim().length >= 1,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
