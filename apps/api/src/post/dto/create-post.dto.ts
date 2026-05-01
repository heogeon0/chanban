import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PostTag, VoteStatus } from '@chanban/shared-types';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsEnum(PostTag)
  tag: PostTag;

  @IsOptional()
  @IsBoolean()
  showCreatorOpinion?: boolean;

  @IsOptional()
  @IsIn([VoteStatus.AGREE, VoteStatus.DISAGREE])
  creatorOpinion?: VoteStatus;

  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  images?: string[];
}
