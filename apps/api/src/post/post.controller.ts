import { PostTag, UserRole } from '@chanban/shared-types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User } from 'src/entities';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ParsePostTagPipe } from './pipes/parse-post-tag.pipe';
import { PostService } from './post.service';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('recent')
  findRecentPosts(@Query() paginationQuery: PaginationQueryDto) {
    return this.postService.findRecentPosts(paginationQuery);
  }

  @Get('search')
  searchPosts(@Query() searchQueryDto: SearchQueryDto) {
    return this.postService.searchPosts(searchQueryDto);
  }

  @Get('official')
  findOfficialPosts(@Query() paginationQuery: PaginationQueryDto) {
    return this.postService.findOfficialPosts(paginationQuery);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('official')
  createOfficial(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    return this.postService.create(createPostDto, user, { isOfficial: true });
  }

  @Get('/tags/:tag')
  findPostsByTag(
    @Param('tag', ParsePostTagPipe) tag: PostTag,
    @Query() queryDto: PostQueryDto,
  ) {
    return this.postService.findPostsByTag(tag, queryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: User) {
    return this.postService.create(createPostDto, user);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }

  @Get(':id/vote-count')
  getVoteCount(@Param('id') id: string) {
    return this.postService.getVoteCount(id);
  }

  /** 피드 카드 client island가 fresh로 가져가는 카운트 묶음 (찬반/중립/뷰/댓글) */
  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.postService.getPostStats(id);
  }
}
