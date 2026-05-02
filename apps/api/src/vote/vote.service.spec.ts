import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Post } from '../entities/post.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { Vote } from '../entities/vote.entity';
import { VoteService } from './vote.service';

describe('VoteService', () => {
  let service: VoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoteService,
        { provide: getRepositoryToken(Vote), useValue: {} },
        { provide: getRepositoryToken(VoteHistory), useValue: {} },
        { provide: getRepositoryToken(Post), useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<VoteService>(VoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
