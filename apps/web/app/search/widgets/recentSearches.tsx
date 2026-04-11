"use client";

import { Clock, X } from "lucide-react";
import { useRecentSearches } from "../features/use-recent-searches";

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

/**
 * 최근 검색 기록 컴포넌트
 * 검색어 클릭 시 onSelect 호출, X 버튼으로 개별 삭제, 전체 삭제 지원
 */
export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const { searches, removeSearch, clearAll } = useRecentSearches();

  if (searches.length === 0) return null;

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[13px] font-semibold text-muted-foreground">최근 검색</span>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
        >
          전체 삭제
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {searches.map((query) => (
          <div key={query} className="flex items-center gap-1 bg-muted rounded-full pl-3 pr-2 py-1.5">
            <button
              type="button"
              onClick={() => onSelect(query)}
              className="text-[13px] font-medium"
            >
              {query}
            </button>
            <button
              type="button"
              onClick={() => removeSearch(query)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
