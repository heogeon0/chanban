import {
  ErrorCode,
  PaginationMeta,
  PostSortBy,
  PostTag,
  SortOrder,
  VoteCountResponse,
} from '@chanban/shared-types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ResponseWithMeta } from '../common/dto/response.dto';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PostQueryDto } from './dto/post-query.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
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
    // 비즈니스 로직 검증: 작성자 의견 공개 시 의견 필수
    if (createPostDto.showCreatorOpinion && !createPostDto.creatorOpinion) {
      throw new BadRequestException({
        code: ErrorCode.BAD_REQUEST,
      });
    }

    const post = this.postRepository.create({
      ...createPostDto,
      creatorId: user.id,
    });

    const savedPost = await this.postRepository.save(post);

    // creator 정보 포함해서 반환
    const postWithCreator = await this.postRepository.findOne({
      where: { id: savedPost.id },
      relations: ['creator'],
    });

    if (!postWithCreator) {
      throw new Error('Failed to retrieve created post');
    }

    return postWithCreator;
  }

  findAll() {
    return `This action returns all post`;
  }

  async findOne(id: string): Promise<Post> {
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

    return post;
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
