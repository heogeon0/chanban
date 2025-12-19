import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';

export enum PostSortBy {
  RECENT = 'recent',
  POPULAR = 'popular',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PostQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(PostSortBy)
  sort?: PostSortBy = PostSortBy.RECENT;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;
}
