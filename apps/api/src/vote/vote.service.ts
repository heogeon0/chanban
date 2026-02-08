import { ErrorCode, VoteStatus } from '@chanban/shared-types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { Vote } from '../entities/vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';

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

  async upsertVote(createVoteDto: CreateVoteDto, userId: string): Promise<Vote> {
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

    /**
     *
     * !!!!!!!!!!!!!!!!! TODO: 게시글 집계 업데이트 로직 추가
     *
     */
    // Transaction으로 투표 생성/수정 + 이력 추가
    return await this.dataSource.transaction(async (manager) => {
      // 기존 투표 확인
      let vote = await manager.findOne(Vote, {
        where: { postId, userId },
      });

      const post = await manager.findOne(Post, {
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException({
          code: ErrorCode.POST_NOT_FOUND,
        });
      }

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

        if (previousStatus === VoteStatus.AGREE) {
          post.agreeCount -= 1;
        } else if (previousStatus === VoteStatus.DISAGREE) {
          post.disagreeCount -= 1;
        } else if (previousStatus === VoteStatus.NEUTRAL) {
          post.neutralCount -= 1;
        }

        await manager.save(history);
      } else {
        // 새로운 투표 생성
        vote = manager.create(Vote, {
          postId,
          userId,
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

        // 게시글 집계 업데이트
        await manager.save(history);
      }

      if (status === VoteStatus.AGREE) {
        post.agreeCount += 1;
      } else if (status === VoteStatus.DISAGREE) {
        post.disagreeCount += 1;
      } else if (status === VoteStatus.NEUTRAL) {
        post.neutralCount += 1;
      }

      await manager.save(post);
      return vote;
    });
  }

  async getMyVote(postId: string, userId: string): Promise<Vote | null> {
    const vote = await this.voteRepository.findOne({
      where: { postId, userId },
    });

    return vote;
  }

  findAll() {
    return `This action returns all vote`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vote`;
  }

  update(id: number) {
    return `This action updates a #${id} vote`;
  }

  remove(id: number) {
    return `This action removes a #${id} vote`;
  }
}
