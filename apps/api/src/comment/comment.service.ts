import {
  CommentReplyResponse,
  CommentResponse,
  ErrorCode,
  PaginationMeta,
  VoteHistoryResponse,
  VoteStatus,
} from '@chanban/shared-types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { z } from 'zod';
import { ResponseWithMeta } from '../common/dto/response.dto';
import { CommentLike } from '../entities/comment-like.entity';
import { Comment } from '../entities/comment.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { Vote } from '../entities/vote.entity';
import { PaginationQueryDto } from '../post/dto/pagination-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const ReplyRawSchema = z.object({
  reply_id: z.string(),
  reply_content: z.string(),
  reply_createdAt: z.date(),
  reply_updatedAt: z.date(),
  reply_deletedAt: z.date().nullable(),
  reply_postId: z.string(),
  reply_parentId: z.string(),
  user_id: z.string(),
  user_nickname: z.string(),
  row_num: z.string(),
});

const ReplyCountRawSchema = z.object({
  parentId: z.string(),
  count: z.string(),
});

const VoteHistoryRawSchema = z.object({
  vh_fromStatus: z.nativeEnum(VoteStatus).nullable(),
  vh_toStatus: z.nativeEnum(VoteStatus),
  vh_changedAt: z.date(),
  v_userId: z.string(),
});

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(VoteHistory)
    private readonly voteHistoryRepository: Repository<VoteHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async findByPostId(
    postId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<ResponseWithMeta<CommentResponse[], PaginationMeta>> {
    // TODO: JWT 토큰에서 userId 가져오기
    const MOCK_USER_ID = '181eaff6-755d-4c90-96ad-31de54fe5b5b';

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

    const parsedReplies = repliesRaw.map((rawData) =>
      ReplyRawSchema.parse(rawData),
    );

    // 답글을 parentId별로 그룹핑 (최신 3개만)
    const repliesByParentId = new Map<
      string,
      Omit<CommentReplyResponse, 'voteHistory' | 'isLiked'>[]
    >();
    parsedReplies.forEach((reply) => {
      if (parseInt(reply.row_num) <= REPLY_LIMIT) {
        const parentId = reply.reply_parentId;
        if (!repliesByParentId.has(parentId)) {
          repliesByParentId.set(parentId, []);
        }

        repliesByParentId.get(parentId)!.push({
          id: reply.reply_id,
          content: reply.reply_content,
          createdAt: reply.reply_createdAt,
          updatedAt: reply.reply_updatedAt,
          deletedAt: reply.reply_deletedAt,
          postId: reply.reply_postId,
          user: {
            id: reply.user_id,
            nickname: reply.user_nickname,
            voteHistory: [],
          },
        });
      }
    });

    // 쿼리 3: 각 댓글의 전체 답글 개수 조회
    const replyCountsRaw = await this.commentRepository
      .createQueryBuilder('reply')
      .select('reply.parentId', 'parentId')
      .addSelect('COUNT(*)', 'count')
      .where('reply.parentId IN (:...commentIds)', { commentIds })
      .andWhere('reply.deletedAt IS NULL')
      .groupBy('reply.parentId')
      .getRawMany();

    const replyCountMap = new Map<string, number>();
    replyCountsRaw.forEach((rawData) => {
      const rc = ReplyCountRawSchema.parse(rawData);
      replyCountMap.set(rc.parentId, parseInt(rc.count));
    });

    // 모든 댓글/답글 작성자 ID 수집
    const allUserIds = new Set<string>();
    const allCommentIds = new Set<string>();
    comments.forEach((comment) => {
      allUserIds.add(comment.user.id);
      allCommentIds.add(comment.id);
      const replies = repliesByParentId.get(comment.id) || [];
      replies.forEach((reply) => {
        allUserIds.add(reply.user.id);
        allCommentIds.add(reply.id);
      });
    });

    // 쿼리 4: 투표 이력 조회
    const voteHistoryMap = new Map<string, VoteHistoryResponse[]>();

    if (allUserIds.size > 0) {
      const voteHistoriesRaw = await this.voteHistoryRepository
        .createQueryBuilder('vh')
        .innerJoin('vh.vote', 'v')
        .where('v.postId = :postId', { postId })
        .andWhere('v.userId IN (:...userIds)', {
          userIds: Array.from(allUserIds),
        })
        .select(['vh.fromStatus', 'vh.toStatus', 'vh.changedAt', 'v.userId'])
        .orderBy('vh.changedAt', 'ASC')
        .getRawMany();

      voteHistoriesRaw.forEach((rawData) => {
        const history = VoteHistoryRawSchema.parse(rawData);
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

    // 쿼리 5: 현재 사용자의 좋아요 여부 조회
    const likedCommentIds = new Set<string>();

    if (allCommentIds.size > 0) {
      const likes = await this.commentLikeRepository.find({
        where: {
          commentId: In(Array.from(allCommentIds)),
          userId: MOCK_USER_ID,
        },
        select: ['commentId'],
      });

      likes.forEach((like) => {
        likedCommentIds.add(like.commentId);
      });
    }

    // 응답 데이터 구성
    const items = comments.map((comment) => {
      const voteHistory = voteHistoryMap.get(comment.user.id) || [];
      const replyList = repliesByParentId.get(comment.id) || [];

      // 답글을 오래된 순서로 정렬 (가장 오래된 답글이 위로, 최신 답글이 아래로)
      const replies: CommentReplyResponse[] = replyList
        .map((reply) => {
          return {
            ...reply,
            isLiked: likedCommentIds.has(reply.id),
            voteHistory: voteHistoryMap.get(reply.user.id) || [],
          };
        })
        .reverse();

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        deletedAt: comment.deletedAt,
        user: {
          id: comment.user.id,
          nickname: comment.user.nickname,
          voteHistory: voteHistory,
        },
        postId: comment.postId,
        parentId: comment.parentId,
        replies: replies.reverse(),
        totalReplies: replyCountMap.get(comment.id) || 0,
        isLiked: likedCommentIds.has(comment.id),
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
    // TODO: JWT 토큰에서 userId 가져오기
    const MOCK_USER_ID = '181eaff6-755d-4c90-96ad-31de54fe5b5b';

    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    // 답글 조회 (오래된 순서로 정렬)
    const [replies, total] = await this.commentRepository.findAndCount({
      where: {
        parentId: commentId,
        deletedAt: IsNull(),
      },
      relations: ['user'],
      order: {
        createdAt: 'ASC',
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
    const replyIds = replies.map((r) => r.id);
    const postId = replies[0].postId;

    const voteHistoryMap = new Map<string, VoteHistoryResponse[]>();

    const voteHistoriesRaw = await this.voteHistoryRepository
      .createQueryBuilder('vh')
      .innerJoin('vh.vote', 'v')
      .where('v.postId = :postId', { postId })
      .andWhere('v.userId IN (:...userIds)', { userIds })
      .select(['vh.fromStatus', 'vh.toStatus', 'vh.changedAt', 'v.userId'])
      .orderBy('vh.changedAt', 'ASC')
      .getRawMany();

    voteHistoriesRaw.forEach((rawData) => {
      const history = VoteHistoryRawSchema.parse(rawData);
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

    // 현재 사용자의 좋아요 여부 조회
    const likedCommentIds = new Set<string>();
    const likes = await this.commentLikeRepository.find({
      where: {
        commentId: In(replyIds),
        userId: MOCK_USER_ID,
      },
      select: ['commentId'],
    });

    likes.forEach((like) => {
      likedCommentIds.add(like.commentId);
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
        voteHistory: voteHistoryMap.get(reply.user.id) || [],
      },
      postId: reply.postId,
      isLiked: likedCommentIds.has(reply.id),
    }));

    const totalPages = Math.ceil(total / limit);

    return new ResponseWithMeta(items, {
      total,
      page,
      limit,
      totalPages,
    });
  }

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    // TODO: JWT 토큰에서 userId 가져오기
    const MOCK_USER_ID = '181eaff6-755d-4c90-96ad-31de54fe5b5b';

    const { content, postId, parentId } = createCommentDto;

    // parentId가 있으면 답글 작성
    if (parentId) {
      // 부모 댓글 존재 확인
      const parentComment = await this.commentRepository.findOne({
        where: { id: parentId, deletedAt: IsNull() },
      });

      if (!parentComment) {
        throw new NotFoundException({
          code: ErrorCode.COMMENT_NOT_FOUND,
        });
      }

      // 부모 댓글이 이미 답글인지 확인 (2단계 중첩 방지)
      if (parentComment.parentId !== null) {
        throw new BadRequestException({
          code: ErrorCode.INVALID_COMMENT_NESTING,
        });
      }

      // 부모 댓글의 postId와 일치하는지 확인
      if (parentComment.postId !== postId) {
        throw new BadRequestException({
          code: ErrorCode.BAD_REQUEST,
        });
      }
    }

    // 댓글/답글 생성
    const comment = this.commentRepository.create({
      content,
      postId,
      parentId: parentId || null,
      userId: MOCK_USER_ID,
    });

    const savedComment = await this.commentRepository.save(comment);

    // user 정보 포함해서 반환
    const commentWithUser = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });

    if (!commentWithUser) {
      throw new Error('Failed to retrieve created comment');
    }

    return commentWithUser;
  }

  async remove(id: string): Promise<void> {
    // TODO: JWT 토큰에서 userId 가져오기
    const MOCK_USER_ID = '181eaff6-755d-4c90-96ad-31de54fe5b5b';

    // 댓글 존재 확인
    const comment = await this.commentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException({
        code: ErrorCode.COMMENT_NOT_FOUND,
      });
    }

    // 본인 댓글인지 확인
    if (comment.userId !== MOCK_USER_ID) {
      throw new BadRequestException({
        code: ErrorCode.FORBIDDEN,
      });
    }

    const now = new Date();

    // 원댓글인 경우 (parentId가 null) 하위 답글도 모두 삭제
    if (comment.parentId === null) {
      // 하위 답글 모두 soft delete
      await this.commentRepository
        .createQueryBuilder()
        .update(Comment)
        .set({ deletedAt: now })
        .where('parentId = :parentId', { parentId: id })
        .andWhere('deletedAt IS NULL')
        .execute();
    }

    // 댓글 자체 soft delete
    comment.deletedAt = now;
    await this.commentRepository.save(comment);
  }

  async likeComment(commentId: string): Promise<void> {
    // TODO: JWT 토큰에서 userId 가져오기
    const MOCK_USER_ID = '181eaff6-755d-4c90-96ad-31de54fe5b5b';

    // 댓글 존재 확인
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException({
        code: ErrorCode.COMMENT_NOT_FOUND,
      });
    }

    // 이미 좋아요 했는지 확인
    const existingLike = await this.commentLikeRepository.findOne({
      where: { commentId, userId: MOCK_USER_ID },
    });

    if (existingLike) {
      // 이미 좋아요한 경우
      throw new BadRequestException({
        code: ErrorCode.BAD_REQUEST,
        message: '이미 좋아요한 댓글입니다',
      });
    }

    // Transaction으로 좋아요 생성 + 카운트 증가
    await this.dataSource.transaction(async (manager) => {
      // 좋아요 생성
      const like = manager.create(CommentLike, {
        commentId,
        userId: MOCK_USER_ID,
      });

      await manager.save(like);
      await manager.increment(Comment, { id: commentId }, 'likeCount', 1);
    });
  }

  async unlikeComment(commentId: string): Promise<void> {
    // TODO: JWT 토큰에서 userId 가져오기
    const MOCK_USER_ID = '181eaff6-755d-4c90-96ad-31de54fe5b5b';

    /** 좋아요 존재하는지 확인 */
    const existingLike = await this.commentLikeRepository.findOne({
      where: { commentId, userId: MOCK_USER_ID },
    });

    if (!existingLike) {
      throw new NotFoundException({
        code: ErrorCode.BAD_REQUEST,
        message: '좋아요한 댓글이 아닙니다',
      });
    }

    await this.dataSource.transaction(async (manager) => {
      // 좋아요 삭제
      const result = await manager.delete(CommentLike, {
        commentId,
        userId: MOCK_USER_ID,
      });

      // 삭제된 좋아요가 있으면 카운트 감소
      if (result.affected && result.affected > 0) {
        await manager.decrement(Comment, { id: commentId }, 'likeCount', 1);
      }
    });
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
}
