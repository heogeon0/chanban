"use client";

import { TopicCard } from "@/app/topics/widgets/topicCard";
import { PostResponse } from "@chanban/shared-types";
import { useEffect, useState } from "react";

interface TopicCarouselProps {
  /** 캐러셀에 표시할 토픽 목록 */
  topics: PostResponse[];
  /** 자동 전환 간격 (ms), 기본값 3500 */
  intervalMs?: number;
}

/**
 * 토픽 목록을 자동으로 순환하며 표시하는 캐러셀 컴포넌트.
 * 데이터를 직접 fetch하지 않고 props로만 받습니다.
 *
 * @param topics - 표시할 토픽 목록
 * @param intervalMs - 자동 전환 간격
 */
export function TopicCarousel({ topics, intervalMs = 3500 }: TopicCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (topics.length <= 1) return;

    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % topics.length);
        setVisible(true);
      }, 200);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [topics.length, intervalMs]);

  if (topics.length === 0) return null;

  return (
    <div>
      {/* 카드 */}
      <div
        className="rounded-xl border border-border bg-card overflow-hidden transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <TopicCard post={topics[current]} />
      </div>

      {/* 인디케이터 */}
      {topics.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {topics.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setVisible(true); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
