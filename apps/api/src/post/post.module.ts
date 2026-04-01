import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from '../entities/post.entity';
import { Vote } from '../entities/vote.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { SummaryModule } from '../summary/summary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Vote, VoteHistory]), SummaryModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
