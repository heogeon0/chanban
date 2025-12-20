import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from '../entities/comment.entity';
import { Vote } from '../entities/vote.entity';
import { VoteHistory } from '../entities/vote-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Vote, VoteHistory])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
