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
import { User } from 'src/entities';
import { PaginationQueryDto } from '../post/dto/pagination-query.dto';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('posts/:postId')
  async findByPostId(
    @Param('postId') postId: string,
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.commentService.findByPostId(postId, paginationQuery, user.id);
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
