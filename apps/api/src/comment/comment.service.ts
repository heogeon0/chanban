import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import {
  CommentResponse,
  CommentReplyResponse,
  VoteHistoryResponse,
  PaginationMeta,
} from '@chanban/shared-types';
import { Comment } from '../entities/comment.entity';
import { Vote } from '../entities/vote.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { ResponseWithMeta } from '../common/dto/response.dto';
import { PaginationQueryDto } from '../post/dto/pagination-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(VoteHistory)
    private readonly voteHistoryRepository: Repository<VoteHistory>,
  ) {}

  async findByPostId(
    postId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<ResponseWithMeta<CommentResponse[], PaginationMeta>> {
    const { page = 1, limit = 20 } = paginationQuery;
    const skip = (page - 1) * limit;
    const REPLY_LIMIT = 3;

    // 쿼리 1: 최상위 댓글만 조회 (답글 제외)
    const [comments, total] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentId IS NULL')
      .andWhere('comment.deletedAt IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    if (comments.length === 0) {
      return new ResponseWithMeta([], {
        total,
        page,
        limit,
        totalPages: 0,
      });
    }

    const commentIds = comments.map((c) => c.id);

    // 쿼리 2: 각 댓글의 답글 최신 3개씩 조회 (윈도우 함수 사용)
    const repliesRaw = await this.commentRepository
      .createQueryBuilder('reply')
      .leftJoin('reply.user', 'user')
      .select([
        'reply.id',
        'reply.content',
        'reply.createdAt',
        'reply.updatedAt',
        'reply.deletedAt',
        'reply.postId',
        'reply.parentId',
        'user.id',
        'user.nickname',
      ])
      .addSelect(
        'ROW_NUMBER() OVER (PARTITION BY reply.parentId ORDER BY reply.createdAt DESC)',
        'row_num',
      )
      .where('reply.parentId IN (:...commentIds)', { commentIds })
      .andWhere('reply.deletedAt IS NULL')
      .getRawMany();

    // 답글을 parentId별로 그룹핑 (최신 3개만)
    const repliesByParentId = new Map<string, any[]>();
    repliesRaw.forEach((raw) => {
      if (parseInt(raw.row_num) <= REPLY_LIMIT) {
        const parentId = raw.reply_parentId;
        if (!repliesByParentId.has(parentId)) {
          repliesByParentId.set(parentId, []);
        }
        repliesByParentId.get(parentId)!.push({
          id: raw.reply_id,
          content: raw.reply_content,
          createdAt: raw.reply_createdAt,
          updatedAt: raw.reply_updatedAt,
          deletedAt: raw.reply_deletedAt,
          postId: raw.reply_postId,
          user: {
            id: raw.user_id,
            nickname: raw.user_nickname,
          },
        });
      }
    });

    // 쿼리 3: 각 댓글의 전체 답글 개수 조회
    const replyCounts = await this.commentRepository
      .createQueryBuilder('reply')
      .select('reply.parentId', 'parentId')
      .addSelect('COUNT(*)', 'count')
      .where('reply.parentId IN (:...commentIds)', { commentIds })
      .andWhere('reply.deletedAt IS NULL')
      .groupBy('reply.parentId')
      .getRawMany();

    const replyCountMap = new Map<string, number>();
    replyCounts.forEach((rc) => {
      replyCountMap.set(rc.parentId, parseInt(rc.count));
    });

    // 모든 댓글/답글 작성자 ID 수집
    const allUserIds = new Set<string>();
    comments.forEach((comment) => {
      allUserIds.add(comment.user.id);
      const replies = repliesByParentId.get(comment.id) || [];
      replies.forEach((reply) => {
        allUserIds.add(reply.user.id);
      });
    });

    // 쿼리 2: 투표 이력 조회
    const voteHistoryMap = new Map<string, VoteHistoryResponse[]>();

    if (allUserIds.size > 0) {
      const voteHistories = await this.voteHistoryRepository
        .createQueryBuilder('vh')
        .innerJoin('vh.vote', 'v')
        .where('v.postId = :postId', { postId })
        .andWhere('v.userId IN (:...userIds)', { userIds: Array.from(allUserIds) })
        .select([
          'vh.fromStatus',
          'vh.toStatus',
          'vh.changedAt',
          'v.userId',
        ])
        .orderBy('vh.changedAt', 'ASC')
        .getRawMany();

      voteHistories.forEach((history) => {
        const userId = history.v_userId;
        if (!voteHistoryMap.has(userId)) {
          voteHistoryMap.set(userId, []);
        }
        voteHistoryMap.get(userId)!.push({
          fromStatus: history.vh_fromStatus,
          toStatus: history.vh_toStatus,
          changedAt: history.vh_changedAt,
        });
      });
    }

    // 응답 데이터 구성
    const items = comments.map((comment) => {
      const voteHistory = voteHistoryMap.get(comment.user.id) || [];
      const replyList = repliesByParentId.get(comment.id) || [];

      const replies: CommentReplyResponse[] = replyList.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        deletedAt: reply.deletedAt,
        user: reply.user,
        postId: reply.postId,
        voteHistory: voteHistoryMap.get(reply.user.id) || [],
      }));

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        user: {
          id: comment.user.id,
          nickname: comment.user.nickname,
        },
        postId: comment.postId,
        parentId: comment.parentId,
        replies,
        totalReplies: replyCountMap.get(comment.id) || 0,
        voteHistory,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return new ResponseWithMeta(items, {
      total,
      page,
      limit,
      totalPages,
    });
  }

  async findRepliesByCommentId(
    commentId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<ResponseWithMeta<CommentReplyResponse[], PaginationMeta>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    // 답글 조회
    const [replies, total] = await this.commentRepository.findAndCount({
      where: {
        parentId: commentId,
        deletedAt: IsNull(),
      },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    if (replies.length === 0) {
      return new ResponseWithMeta([], {
        total,
        page,
        limit,
        totalPages: 0,
      });
    }

    // 답글 작성자들의 투표 이력 조회
    const userIds = replies.map((r) => r.user.id);
    const postId = replies[0].postId;

    const voteHistoryMap = new Map<string, VoteHistoryResponse[]>();

    const voteHistories = await this.voteHistoryRepository
      .createQueryBuilder('vh')
      .innerJoin('vh.vote', 'v')
      .where('v.postId = :postId', { postId })
      .andWhere('v.userId IN (:...userIds)', { userIds })
      .select(['vh.fromStatus', 'vh.toStatus', 'vh.changedAt', 'v.userId'])
      .orderBy('vh.changedAt', 'ASC')
      .getRawMany();

    voteHistories.forEach((history) => {
      const userId = history.v_userId;
      if (!voteHistoryMap.has(userId)) {
        voteHistoryMap.set(userId, []);
      }
      voteHistoryMap.get(userId)!.push({
        fromStatus: history.vh_fromStatus,
        toStatus: history.vh_toStatus,
        changedAt: history.vh_changedAt,
      });
    });

    // 응답 데이터 구성
    const items: CommentReplyResponse[] = replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      deletedAt: reply.deletedAt,
      user: {
        id: reply.user.id,
        nickname: reply.user.nickname,
      },
      postId: reply.postId,
      voteHistory: voteHistoryMap.get(reply.user.id) || [],
    }));

    const totalPages = Math.ceil(total / limit);

    return new ResponseWithMeta(items, {
      total,
      page,
      limit,
      totalPages,
    });
  }

  create(createCommentDto: CreateCommentDto) {
    return 'This action adds a new comment';
  }

  findAll() {
    return `This action returns all comment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
