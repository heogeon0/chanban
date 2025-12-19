import { Post } from '../../entities/post.entity';

export class PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PaginatedPostsResponseDto {
  data: Post[];
  meta: PaginationMeta;
}

export class PostsData {
  items: Post[];
}
