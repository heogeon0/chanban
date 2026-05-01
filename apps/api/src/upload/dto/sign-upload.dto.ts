import {
  IsIn,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type {
  UploadMimeType,
  UploadScope,
} from '@chanban/shared-types';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES: UploadMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const SCOPES: UploadScope[] = ['post', 'comment'];

export class SignUploadDto {
  @IsIn(SCOPES)
  scope: UploadScope;

  @IsString()
  @MaxLength(200)
  filename: string;

  @IsIn(ALLOWED_MIME_TYPES)
  mimeType: UploadMimeType;

  @IsInt()
  @Min(1)
  @Max(MAX_IMAGE_SIZE)
  size: number;
}
