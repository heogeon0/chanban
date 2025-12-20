import type { PaginationMeta, PostResponse } from '@chanban/shared-types';

export type { PaginationMeta };

export class PaginatedPostsResponseDto {
  data: PostResponse[];
  meta: PaginationMeta;
}
