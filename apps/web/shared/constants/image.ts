import type { UploadMimeType } from "@chanban/shared-types";

export const MAX_POST_IMAGES = 5;
export const MAX_COMMENT_IMAGES = 2;
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES: UploadMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_IMAGE_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(",");
