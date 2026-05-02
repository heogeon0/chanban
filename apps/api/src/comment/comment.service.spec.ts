import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentLike } from '../entities/comment-like.entity';
import { Comment } from '../entities/comment.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { Vote } from '../entities/vote.entity';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: getRepositoryToken(Comment), useValue: {} },
        { provide: getRepositoryToken(CommentLike), useValue: {} },
        { provide: getRepositoryToken(Vote), useValue: {} },
        { provide: getRepositoryToken(VoteHistory), useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
