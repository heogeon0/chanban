import {
  ErrorCode,
  PaginationMeta,
  PostSortBy,
  PostTag,
  SortOrder,
  VoteCountResponse,
  VoteStatus,
} from '@chanban/shared-types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { ResponseWithMeta } from '../common/dto/response.dto';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Vote } from '../entities/vote.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PostQueryDto } from './dto/post-query.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(VoteHistory)
    private readonly voteHistoryRepository: Repository<VoteHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async findRecentPosts(
    paginationQuery: PaginationQueryDto,
  ): Promise<ResponseWithMeta<Post[], PaginationMeta>> {
    const { page = 1, limit = 20, sort = PostSortBy.RECENT } = paginationQuery;
    const skip = (page - 1) * limit;

    const [items, total] = await this.postRepository.findAndCount({
      where: { deletedAt: IsNull() },
      order:
        sort === PostSortBy.POPULAR
          ? { popularityScore: 'DESC' }
          : { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['creator'],
    });

    const totalPages = Math.ceil(total / limit);

    return new ResponseWithMeta(items, {
      total,
      page,
      limit,
      totalPages,
    });
  }

  async findPostsByTag(
    tag: PostTag,
    queryDto: PostQueryDto,
  ): Promise<ResponseWithMeta<Post[], PaginationMeta>> {
    const {
      page = 1,
      limit = 20,
      sort = PostSortBy.RECENT,
      order = SortOrder.DESC,
    } = queryDto;
    const skip = (page - 1) * limit;

    const orderBy =
      sort === PostSortBy.POPULAR
        ? { popularityScore: order, createdAt: 'DESC' as const }
        : { createdAt: order };

    const [items, total] = await this.postRepository.findAndCount({
      where: {
        tag,
        deletedAt: IsNull(),
      },
      order: orderBy,
      skip,
      take: limit,
      relations: ['creator'],
    });

    const totalPages = Math.ceil(total / limit);

    return new ResponseWithMeta(items, {
      total,
      page,
      limit,
      totalPages,
    });
  }

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const { creatorOpinion, showCreatorOpinion, ...postData } = createPostDto;

    // 비즈니스 로직 검증: 작성자 의견 공개 시 의견 필수
    if (showCreatorOpinion && !creatorOpinion) {
      throw new BadRequestException({
        code: ErrorCode.BAD_REQUEST,
      });
    }

    // Transaction으로 Post 생성 + Vote 생성
    return await this.dataSource.transaction(async (manager) => {
      // Post 생성
      const post = manager.create(Post, {
        ...postData,
        showCreatorOpinion: showCreatorOpinion ?? false,
        creatorId: user.id,
      });

      const savedPost = await manager.save(post);

      // 작성자 의견이 있으면 Vote 생성
      if (showCreatorOpinion && creatorOpinion) {
        const vote = manager.create(Vote, {
          postId: savedPost.id,
          userId: user.id,
          currentStatus: creatorOpinion,
          changeCount: 0,
        });

        await manager.save(vote);

        // 투표 이력 추가
        const history = manager.create(VoteHistory, {
          voteId: vote.id,
          fromStatus: null,
          toStatus: creatorOpinion,
        });

        await manager.save(history);

        // 투표 카운트 업데이트
        if (creatorOpinion === VoteStatus.AGREE) {
          savedPost.agreeCount = 1;
        } else if (creatorOpinion === VoteStatus.DISAGREE) {
          savedPost.disagreeCount = 1;
        } else if (creatorOpinion === VoteStatus.NEUTRAL) {
          savedPost.neutralCount = 1;
        }

        await manager.save(savedPost);
      }

      // creator 정보 포함해서 반환
      const postWithCreator = await manager.findOne(Post, {
        where: { id: savedPost.id },
        relations: ['creator'],
      });

      if (!postWithCreator) {
        throw new Error('Failed to retrieve created post');
      }

      return postWithCreator;
    });
  }

  findAll() {
    return `This action returns all post`;
  }

  async findOne(id: string): Promise<Post & { creatorVote?: VoteStatus | null }> {
    const post = await this.postRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['creator'],
    });

    if (!post) {
      throw new NotFoundException({
        code: ErrorCode.POST_NOT_FOUND,
      });
    }

    // 조회수 증가
    await this.postRepository.increment({ id }, 'viewCount', 1);
    post.viewCount += 1;

    // 작성자 의견 공개인 경우 투표 정보 조회
    let creatorVote: VoteStatus | null = null;
    if (post.showCreatorOpinion) {
      const vote = await this.voteRepository.findOne({
        where: { postId: id, userId: post.creatorId },
      });
      creatorVote = vote?.currentStatus ?? null;
    }

    return { ...post, creatorVote };
  }

  update(id: number) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }

  async getVoteCount(id: string): Promise<VoteCountResponse> {
    const post = await this.postRepository.findOne({ where: { id } });

    console.log(post, 'post');
    return {
      agreeCount: post?.agreeCount || 0,
      disagreeCount: post?.disagreeCount || 0,
      neutralCount: post?.neutralCount || 0,
    };
  }
}
