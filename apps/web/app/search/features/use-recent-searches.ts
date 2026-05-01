"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "chanban:recent-searches";
const MAX_ITEMS = 10;

/**
 * 최근 검색 기록 훅 (localStorage 기반)
 * SSR 환경에서 안전하게 동작합니다.
 */
export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setSearches(stored ? JSON.parse(stored) : []);
    } catch {
      setSearches([]);
    }
  }, []);

  const persist = useCallback((next: string[]) => {
    setSearches(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const addSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      const next = [trimmed, ...searches.filter((s) => s !== trimmed)].slice(
        0,
        MAX_ITEMS
      );
      persist(next);
    },
    [searches, persist]
  );

  const removeSearch = useCallback(
    (q: string) => {
      persist(searches.filter((s) => s !== q));
    },
    [searches, persist]
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return { searches, addSearch, removeSearch, clearAll };
}
