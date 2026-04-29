"use client";

import { useState, useCallback } from "react";
import type { UploadMimeType, UploadScope } from "@chanban/shared-types";
import { getSupabaseClient } from "@/lib/supabase";
import { uploadDomains } from "@/shared/queries/upload";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE,
} from "@/shared/constants/image";

interface UseImageUploadResult {
  upload: (file: File) => Promise<{ key: string; publicUrl: string }>;
  uploading: boolean;
  error: string | null;
  reset: () => void;
}

const isAllowedMime = (mime: string): mime is UploadMimeType =>
  (ALLOWED_IMAGE_MIME_TYPES as string[]).includes(mime);

/**
 * 이미지를 Supabase Storage에 직접 업로드하는 훅.
 * 1. 클라이언트 검증 (MIME, 크기) → 2. signed URL 발급 요청 → 3. Supabase에 직접 업로드
 */
export function useImageUpload(scope: UploadScope): UseImageUploadResult {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => setError(null), []);

  const upload = useCallback(
    async (file: File) => {
      setError(null);

      if (!isAllowedMime(file.type)) {
        const msg = "지원하지 않는 이미지 형식입니다. (jpeg/png/webp/gif)";
        setError(msg);
        throw new Error(msg);
      }
      if (file.size > MAX_IMAGE_SIZE) {
        const msg = `파일이 너무 큽니다. (최대 ${MAX_IMAGE_SIZE / 1024 / 1024}MB)`;
        setError(msg);
        throw new Error(msg);
      }

      setUploading(true);

      try {
        const sign = await uploadDomains.signUpload({
          scope,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        });

        const supabase = getSupabaseClient();
        const bucket = scope === "post" ? "post-images" : "comment-images";

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .uploadToSignedUrl(sign.key, sign.token, file, {
            contentType: file.type,
          });

        if (uploadError) {
          throw new Error(uploadError.message || "업로드 실패");
        }

        return { key: sign.key, publicUrl: sign.publicUrl };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "업로드 실패";
        setError(msg);
        throw e;
      } finally {
        setUploading(false);
      }
    },
    [scope]
  );

  return { upload, uploading, error, reset };
}
