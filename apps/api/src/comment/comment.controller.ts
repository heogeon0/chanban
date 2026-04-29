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
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/entities';
import { PaginationQueryDto } from '../post/dto/pagination-query.dto';
import { CommentService } from './comment.service';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /** 피드 카드 미리보기용 인기 댓글 TOP N — 비로그인도 조회 가능. 로그인 시 isLiked 채움. */
  @UseGuards(OptionalJwtAuthGuard)
  @Get('posts/:postId/top')
  findTopByPostId(
    @Param('postId') postId: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: User | null,
  ) {
    const parsed = limit ? parseInt(limit, 10) : 5;
    const safeLimit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 20) : 5;
    return this.commentService.findTopByPostId(postId, safeLimit, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts/:postId')
  async findByPostId(
    @Param('postId') postId: string,
    @Query() query: CommentQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.commentService.findByPostId(postId, query, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':commentId/replies')
  findRepliesByCommentId(
    @Param('commentId') commentId: string,
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.commentService.findRepliesByCommentId(
      commentId,
      paginationQuery,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @CurrentUser() user: User) {
    return this.commentService.create(createCommentDto, user.id);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(+id, updateCommentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':commentId/like')
  likeComment(@Param('commentId') commentId: string, @CurrentUser() user: User) {
    return this.commentService.likeComment(commentId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId/like')
  unlikeComment(@Param('commentId') commentId: string, @CurrentUser() user: User) {
    return this.commentService.unlikeComment(commentId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.commentService.remove(id, user.id);
  }
}
