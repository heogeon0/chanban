import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PaginationQueryDto } from '../post/dto/pagination-query.dto';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('posts/:postId')
  findByPostId(
    @Param('postId') postId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.commentService.findByPostId(postId, paginationQuery);
  }

  @Get(':commentId/replies')
  findRepliesByCommentId(
    @Param('commentId') commentId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.commentService.findRepliesByCommentId(
      commentId,
      paginationQuery,
    );
  }

  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }
}
