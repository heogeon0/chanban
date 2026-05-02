import {
  ErrorCode,
  PaginationMeta,
  PostSortBy,
  PostStatsResponse,
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
import { isOwnedImageUrl } from '../common/utils/image-key.util';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Vote } from '../entities/vote.entity';
import { VoteHistory } from '../entities/vote-history.entity';
import { SummaryService } from '../summary/summary.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { SearchQueryDto, SearchType } from './dto/search-query.dto';

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
    private readonly summaryService: SummaryService,
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

  async findOfficialPosts(
    paginationQuery: PaginationQueryDto,
  ): Promise<ResponseWithMeta<Post[], PaginationMeta>> {
    const { page = 1, limit = 20, sort = PostSortBy.RECENT } = paginationQuery;
    const skip = (page - 1) * limit;

    const [items, total] = await this.postRepository.findAndCount({
      where: { isOfficial: true, deletedAt: IsNull() },
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

  async searchPosts(
    searchQueryDto: SearchQueryDto,
  ): Promise<ResponseWithMeta<Post[], PaginationMeta>> {
    const {
      q,
      type = SearchType.ALL,
      page = 1,
      limit = 20,
      sort = PostSortBy.RECENT,
      order = SortOrder.DESC,
    } = searchQueryDto;

    const skip = (page - 1) * limit;
    const keyword = `%${q}%`;

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.creator', 'creator')
      .where('post.deletedAt IS NULL');

    if (type === SearchType.ALL) {
      qb.andWhere(
        '(post.title ILIKE :keyword OR post.content ILIKE :keyword OR creator.nickname ILIKE :keyword)',
        { keyword },
      );
    } else if (type === SearchType.CONTENT) {
      qb.andWhere(
        '(post.title ILIKE :keyword OR post.content ILIKE :keyword)',
        { keyword },
      );
    } else if (type === SearchType.AUTHOR) {
      qb.andWhere('creator.nickname ILIKE :keyword', { keyword });
    }

    if (sort === PostSortBy.POPULAR) {
      qb.orderBy('post.popularityScore', order).addOrderBy('post.createdAt', 'DESC');
    } else {
      qb.orderBy('post.createdAt', order);
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return new ResponseWithMeta(items, { total, page, limit, totalPages });
  }

  async create(
    createPostDto: CreatePostDto,
    user: User,
    options: { isOfficial?: boolean } = {},
  ): Promise<Post> {
    // 클라이언트가 DTO에 보낸 isOfficial은 무시하고, 호출측(컨트롤러)이
    // options.isOfficial로 명시적으로 지정해야만 공식 투표로 저장됨
    const { creatorOpinion, showCreatorOpinion, isOfficial: _ignored, ...postData } =
      createPostDto;
    const isOfficial = options.isOfficial === true;

    // 비즈니스 로직 검증: 작성자 의견 공개 시 의견 필수
    if (showCreatorOpinion && !creatorOpinion) {
      throw new BadRequestException({
        code: ErrorCode.BAD_REQUEST,
      });
    }

    // 이미지 소유권 검증: path prefix가 본인 userId인지 확인
    if (postData.images?.length) {
      for (const url of postData.images) {
        if (!isOwnedImageUrl(url, user.id)) {
          throw new BadRequestException({
            code: ErrorCode.BAD_REQUEST,
          });
        }
      }
    }

    // Transaction으로 Post 생성 + Vote 생성
    const createdPost = await this.dataSource.transaction(async (manager) => {
      // Post 생성
      const post = manager.create(Post, {
        ...postData,
        images: postData.images ?? [],
        showCreatorOpinion: showCreatorOpinion ?? false,
        isOfficial,
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

    // 게시글 생성 후 본문 요약 비동기 생성 (실패해도 무관)
    void this.summaryService.generateContentSummary(createdPost);

    return createdPost;
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

  /**
   * 피드 카드 client island용 카운트 묶음.
   * 5개 컬럼만 SELECT해 페이로드를 가볍게 유지한다.
   */
  async getPostStats(id: string): Promise<PostStatsResponse> {
    const post = await this.postRepository.findOne({
      where: { id },
      select: [
        'agreeCount',
        'disagreeCount',
        'neutralCount',
        'commentCount',
        'viewCount',
      ],
    });

    return {
      agreeCount: post?.agreeCount ?? 0,
      disagreeCount: post?.disagreeCount ?? 0,
      neutralCount: post?.neutralCount ?? 0,
      commentCount: post?.commentCount ?? 0,
      viewCount: post?.viewCount ?? 0,
    };
  }
}
