"use client";

import { useState } from "react";
import { ImageLightbox } from "./imageLightbox";
import { cn } from "@/shared/ui/lib/utils";

interface ImageGalleryProps {
  images: string[];
  /**
   * compact: 댓글/답글용 작은 썸네일 (높이 제한)
   * default: 게시글 본문용 큰 그리드
   */
  variant?: "default" | "compact";
  className?: string;
}

/**
 * 이미지 그리드 + 클릭 시 라이트박스 확대.
 */
export function ImageGallery({
  images,
  variant = "default",
  className,
}: ImageGalleryProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const compact = variant === "compact";

  const layoutClass = (() => {
    if (compact) return "grid grid-cols-2 gap-1.5 max-w-[280px]";
    if (images.length === 1) return "grid grid-cols-1 gap-2";
    if (images.length === 2) return "grid grid-cols-2 gap-2";
    return "grid grid-cols-3 gap-2";
  })();

  const itemClass = compact
    ? "aspect-square w-full rounded-md overflow-hidden bg-muted border border-border"
    : "aspect-square w-full rounded-lg overflow-hidden bg-muted border border-border";

  return (
    <>
      <div className={cn(layoutClass, className)}>
        {images.map((url, idx) => (
          <button
            key={url}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpenIdx(idx);
            }}
            className={cn(itemClass, "cursor-zoom-in")}
            aria-label={`이미지 ${idx + 1} 확대 보기`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`이미지 ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform"
            />
          </button>
        ))}
      </div>

      {openIdx !== null && (
        <ImageLightbox
          images={images}
          index={openIdx}
          onClose={() => setOpenIdx(null)}
          onChange={setOpenIdx}
        />
      )}
    </>
  );
}
