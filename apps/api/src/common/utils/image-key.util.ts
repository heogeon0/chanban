import { randomUUID } from 'crypto';

const ALLOWED_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * 업로드용 storage key를 생성한다.
 * 형식: `{userId}/{yyyy}/{mm}/{uuid}.{ext}`
 */
export function buildImageKey(userId: string, mimeType: string): string {
  const ext = ALLOWED_EXTENSIONS[mimeType];
  if (!ext) {
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
  const now = new Date();
  const yyyy = now.getUTCFullYear().toString();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${userId}/${yyyy}/${mm}/${randomUUID()}.${ext}`;
}

/**
 * publicUrl 또는 storage key의 첫 세그먼트가 userId와 일치하는지 검증.
 * 사용 예: 게시글/댓글 생성 시 dto.images의 각 URL 소유권 확인.
 */
export function isOwnedImageUrl(url: string, userId: string): boolean {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const ownerIdx = segments.findIndex((s) => s === userId);
    return ownerIdx > 0;
  } catch {
    return false;
  }
}
