"use client";

import { useEffect, useRef, useState } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SWIPE_CLOSE_THRESHOLD = 80;
const CLOSE_ANIMATION_DURATION = 280;

/**
 * 모바일 바텀 시트 UI 컴포넌트.
 * 배경 클릭 또는 아래로 스와이프하면 닫힙니다.
 * 열릴 때 slide-in, 닫힐 때 slide-out 애니메이션이 재생됩니다.
 * 데이터를 직접 fetch하지 않고 children으로만 내용을 받습니다.
 *
 * @param isOpen - 시트 열림 여부
 * @param onClose - 닫기 핸들러
 * @param title - 시트 상단 제목
 * @param children - 시트 내용
 */
export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const touchStartY = useRef(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setIsClosing(false);
      setIsMounted(true);
    } else if (isMounted) {
      setIsClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setIsMounted(false);
        setIsClosing(false);
      }, CLOSE_ANIMATION_DURATION);
    }

    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 배경 */}
      <div
        className={`absolute inset-0 bg-black/40 ${isClosing ? "animate-out fade-out duration-280" : "animate-in fade-in duration-200"}`}
        onClick={onClose}
      />

      {/* 시트 */}
      <div
        className={`absolute bottom-0 left-0 right-0 max-w-4xl mx-auto bg-background rounded-t-2xl max-h-[90vh] flex flex-col ${isClosing ? "animate-out slide-out-to-bottom duration-280" : "animate-in slide-in-from-bottom duration-300"}`}
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const diff = e.changedTouches[0].clientY - touchStartY.current;
          if (diff > SWIPE_CLOSE_THRESHOLD) onClose();
        }}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* 제목 */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-base font-bold">{title}</h2>
        </div>

        {/* 내용 */}
        <div className="overflow-y-auto flex-1 pb-safe">{children}</div>
      </div>
    </div>
  );
}
