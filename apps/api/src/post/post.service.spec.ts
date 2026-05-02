import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Vote } from '../entities/vote.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { SummaryService } from '../summary/summary.service';
import { PostService } from './post.service';

describe('PostService', () => {
  let service: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: getRepositoryToken(Post), useValue: {} },
        { provide: getRepositoryToken(Vote), useValue: {} },
        { provide: getRepositoryToken(VoteHistory), useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: SummaryService, useValue: {} },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
