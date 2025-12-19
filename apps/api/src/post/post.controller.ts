import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';
import { ParsePostTagPipe } from '../common/pipes/parse-post-tag.pipe';
import { PostTag } from '../entities/enums';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('recent')
  findRecentPosts(@Query() paginationQuery: PaginationQueryDto) {
    return this.postService.findRecentPosts(paginationQuery);
  }

  @Get(':tag')
  findPostsByTag(
    @Param('tag', ParsePostTagPipe) tag: PostTag,
    @Query() queryDto: PostQueryDto,
  ) {
    return this.postService.findPostsByTag(tag, queryDto);
  }

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
