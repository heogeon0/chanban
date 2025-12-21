import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ErrorCode } from '@chanban/shared-types';
import { Vote } from '../entities/vote.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { Post } from '../entities/post.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UpdateVoteDto } from './dto/update-vote.dto';

@Injectable()
export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(VoteHistory)
    private readonly voteHistoryRepository: Repository<VoteHistory>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly dataSource: DataSource,
  ) {}

  async upsertVote(createVoteDto: CreateVoteDto): Promise<Vote> {
    // TODO: JWT 토큰에서 userId 가져오기
    const MOCK_USER_ID = '181eaff6-755d-4c90-96ad-31de54fe5b5b';

    const { postId, status } = createVoteDto;

    // 포스트 존재 확인
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException({
        code: ErrorCode.POST_NOT_FOUND,
      });
    }

    // Transaction으로 투표 생성/수정 + 이력 추가
    return await this.dataSource.transaction(async (manager) => {
      // 기존 투표 확인
      let vote = await manager.findOne(Vote, {
        where: { postId, userId: MOCK_USER_ID },
      });

      if (vote) {
        // 투표 수정
        const previousStatus = vote.currentStatus;

        // 동일한 상태로 변경하려는 경우 무시
        if (previousStatus === status) {
          return vote;
        }

        vote.currentStatus = status;
        vote.changeCount += 1;
        vote.lastChangedAt = new Date();

        await manager.save(vote);

        // 투표 이력 추가
        const history = manager.create(VoteHistory, {
          voteId: vote.id,
          fromStatus: previousStatus,
          toStatus: status,
        });
        await manager.save(history);
      } else {
        // 새로운 투표 생성
        vote = manager.create(Vote, {
          postId,
          userId: MOCK_USER_ID,
          currentStatus: status,
          changeCount: 0,
        });

        await manager.save(vote);

        // 첫 투표 이력 추가
        const history = manager.create(VoteHistory, {
          voteId: vote.id,
          fromStatus: null,
          toStatus: status,
        });
        await manager.save(history);
      }

      return vote;
    });
  }

  async getMyVote(postId: string): Promise<Vote | null> {
    // TODO: JWT 토큰에서 userId 가져오기
    const MOCK_USER_ID = '181eaff6-755d-4c90-96ad-31de54fe5b5b';

    const vote = await this.voteRepository.findOne({
      where: { postId, userId: MOCK_USER_ID },
    });

    return vote;
  }

  findAll() {
    return `This action returns all vote`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vote`;
  }

  update(id: number, updateVoteDto: UpdateVoteDto) {
    return `This action updates a #${id} vote`;
  }

  remove(id: number) {
    return `This action removes a #${id} vote`;
  }
}
