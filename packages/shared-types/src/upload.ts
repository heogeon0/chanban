export type UploadScope = 'post' | 'comment';

export type UploadMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif';

export interface UploadSignRequest {
  scope: UploadScope;
  filename: string;
  mimeType: UploadMimeType;
  size: number;
}

export interface UploadSignResponse {
  uploadUrl: string;
  token: string;
  key: string;
  publicUrl: string;
}
