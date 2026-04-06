import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PostQueryDto } from './post-query.dto';

export enum SearchType {
  ALL = 'all',
  CONTENT = 'content',
  AUTHOR = 'author',
}

export class SearchQueryDto extends PostQueryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  q: string;

  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;
}
