"use client";

import { TopicCard } from "@/app/topics/widgets/topicCard";
import { PostResponse } from "@chanban/shared-types";
import { useCallback, useEffect, useRef, useState } from "react";

const SWIPE_THRESHOLD = 50;

interface TopicCarouselProps {
  /** 캐러셀에 표시할 토픽 목록 */
  topics: PostResponse[];
  /** 자동 전환 간격 (ms), 기본값 3500 */
  intervalMs?: number;
}

/**
 * 토픽 목록을 자동으로 순환하며 표시하는 캐러셀 컴포넌트.
 * 터치/마우스 드래그로 수동 전환을 지원합니다.
 * 데이터를 직접 fetch하지 않고 props로만 받습니다.
 *
 * @param topics - 표시할 토픽 목록
 * @param intervalMs - 자동 전환 간격
 */
export function TopicCarousel({ topics, intervalMs = 3500 }: TopicCarouselProps) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef(0);
  const wasDragging = useRef(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % topics.length);
    }, intervalMs);
  }, [topics.length, intervalMs]);

  useEffect(() => {
    if (topics.length <= 1) return;
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goTo = (index: number) => {
    setCurrent(index);
    resetTimer();
  };

  const handleDragStart = (x: number) => {
    dragStartX.current = x;
    wasDragging.current = false;
  };

  const handleDragEnd = (x: number) => {
    const diff = dragStartX.current - x;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;

    wasDragging.current = true;
    const next =
      diff > 0
        ? (current + 1) % topics.length
        : (current - 1 + topics.length) % topics.length;
    goTo(next);
  };

  /**
   * 드래그 후 카드 내부 Link 클릭 이벤트 차단.
   * capture 단계에서 처리해야 자식 Link에 전달되기 전에 막을 수 있습니다.
   */
  const handleClickCapture = (e: React.MouseEvent) => {
    if (wasDragging.current) {
      e.stopPropagation();
      wasDragging.current = false;
    }
  };

  const currentTopic = topics[current];
  if (!currentTopic) return null;

  return (
    <div>
      {/* key={current}로 전환 시 fade-in 애니메이션 재생 */}
      <div
        key={current}
        className="animate-in fade-in duration-200 rounded-xl border border-border bg-card overflow-hidden select-none"
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseUp={(e) => handleDragEnd(e.clientX)}
        onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX)}
        onTouchEnd={(e) => e.changedTouches[0] && handleDragEnd(e.changedTouches[0].clientX)}
        onClickCapture={handleClickCapture}
      >
        <TopicCard post={currentTopic} />
      </div>

      {/* 인디케이터 */}
      {topics.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2.5">
          {topics.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
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
