"use client";

import { useRef, useState, useCallback } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { UploadScope } from "@chanban/shared-types";
import { useImageUpload } from "@/shared/hooks/useImageUpload";
import { ALLOWED_IMAGE_ACCEPT } from "@/shared/constants/image";
import { cn } from "@/shared/ui/lib/utils";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxCount: number;
  scope: UploadScope;
  className?: string;
}

/**
 * 게시글/댓글 이미지 업로더 (순수 UI 컴포넌트).
 * value는 업로드 완료된 publicUrl 배열, onChange로 부모에 전달.
 */
export function ImageUploader({
  value,
  onChange,
  maxCount,
  scope,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const { upload, error } = useImageUpload(scope);

  const remaining = maxCount - value.length - pendingCount;

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArr = Array.from(files).slice(0, remaining);
      if (fileArr.length === 0) return;

      setPendingCount((c) => c + fileArr.length);

      const uploadedUrls: string[] = [];
      for (const file of fileArr) {
        try {
          const { publicUrl } = await upload(file);
          uploadedUrls.push(publicUrl);
        } catch {
          // 개별 파일 실패는 무시 (훅 내부에서 error 상태 노출)
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
      }
      setPendingCount((c) => Math.max(0, c - fileArr.length));
    },
    [remaining, upload, value, onChange]
  );

  const handleRemove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {value.map((url, idx) => (
          <div
            key={url}
            className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="업로드 이미지"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              aria-label="이미지 삭제"
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {Array.from({ length: pendingCount }).map((_, i) => (
          <div
            key={`pending-${i}`}
            className="w-20 h-20 rounded-lg border border-border bg-muted flex items-center justify-center"
          >
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={openPicker}
            className="w-20 h-20 rounded-lg border border-dashed border-border bg-muted/30 hover:bg-muted flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px]">
              {value.length + pendingCount}/{maxCount}
            </span>
          </button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
