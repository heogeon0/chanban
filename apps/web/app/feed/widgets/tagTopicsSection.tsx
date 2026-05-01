"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostTag } from "@chanban/shared-types";
import { topicQueries } from "@/shared/queries/topic";
import { TopicCard } from "@/app/topics/widgets/topicCard";
import { FeedSectionHeader } from "./feedSectionHeader";

const TABS = [
  { tag: PostTag.POLITICS, label: "정치" },
  { tag: PostTag.SOCIETY, label: "사회" },
  { tag: PostTag.ECONOMY, label: "경제" },
  { tag: PostTag.TECHNOLOGY, label: "기술" },
] as const;

/**
 * 태그별 토픽 미리보기 섹션
 * 탭 클릭 시 해당 태그의 토픽을 fetch합니다.
 */
export function TagTopicsSection() {
  const [selectedTag, setSelectedTag] = useState<PostTag>(PostTag.POLITICS);

  const { data, isLoading } = useQuery({
    queryKey: ["feed", "tag", selectedTag],
    queryFn: () => topicQueries.list(selectedTag, 1).queryFn(),
  });

  const topics = data?.data.slice(0, 4) ?? [];

  return (
    <section>
      <div className="px-4 pt-5 pb-3">
        <FeedSectionHeader
          title="📂 카테고리별 토픽"
          moreHref={`/topics?tag=${selectedTag}`}
          moreLabel="더보기"
        />
        {/* 탭 */}
        <div className="flex gap-2">
          {TABS.map(({ tag, label }) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 토픽 리스트 */}
      {isLoading ? (
        <div className="divide-y divide-border/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-4 py-4 space-y-2.5">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-1.5 w-full bg-muted rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : topics.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          아직 토픽이 없습니다.
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          {topics.map((topic) => (
            <TopicCard key={topic.id} post={topic} />
          ))}
        </div>
      )}
    </section>
  );
}
