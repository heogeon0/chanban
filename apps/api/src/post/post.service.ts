import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ResponseWithMeta } from '../common/dto/response.dto';
import { PostTag } from '../entities/enums';
import { Post } from '../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PostQueryDto, PostSortBy, SortOrder } from './dto/post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findRecentPosts(paginationQuery: PaginationQueryDto) {
    const { page = 1, limit = 20 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [items, total] = await this.postRepository.findAndCount({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
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

  async findPostsByTag(tag: PostTag, queryDto: PostQueryDto) {
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

  create(createPostDto: CreatePostDto) {
    return 'This action adds a new post';
  }

  findAll() {
    return `This action returns all post`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
