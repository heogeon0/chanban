import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ErrorCode, PaginationMeta, VoteStatus } from '@chanban/shared-types';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { Vote } from '../entities/vote.entity';
import { ResponseWithMeta } from '../common/dto/response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  /**
   * kakaoId로 사용자를 조회합니다.
   * @param kakaoId - 카카오 사용자 ID
   * @returns 사용자 정보 또는 null
   */
  async findByKakaoId(kakaoId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { kakaoId } });
  }

  /**
   * 새로운 사용자를 생성합니다.
   * @param kakaoId - 카카오 사용자 ID
   * @param nickname - 닉네임
   * @param profileImageUrl - 프로필 이미지 URL (선택)
   * @returns 생성된 사용자 정보
   */
  async create(
    kakaoId: string,
    nickname: string,
    profileImageUrl: string | null = null,
  ): Promise<User> {
    const user = this.userRepository.create({
      kakaoId,
      nickname,
      profileImageUrl,
    });
    return this.userRepository.save(user);
  }

  /**
   * ID로 사용자를 조회합니다.
   * @param id - 사용자 ID (UUID)
   * @returns 사용자 정보 또는 null
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 닉네임으로 사용자를 조회합니다.
   * @param nickname - 닉네임
   * @returns 사용자 정보 또는 null
   */
  async findByNickname(nickname: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { nickname } });
  }

  /**
   * 내가 작성한 토픽 목록을 조회합니다.
   * @param userId - 사용자 ID
   * @param page - 페이지 번호
   * @param limit - 페이지당 항목 수
   * @returns 페이지네이션된 토픽 목록
   */
  async findMyPosts(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ResponseWithMeta<Post[], PaginationMeta>> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.postRepository.findAndCount({
      where: { creatorId: userId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['creator'],
    });

    const totalPages = Math.ceil(total / limit);

    return new ResponseWithMeta(items, { total, page, limit, totalPages });
  }

  /**
   * 내가 투표한 내역을 조회합니다.
   * @param userId - 사용자 ID
   * @param page - 페이지 번호
   * @param limit - 페이지당 항목 수
   * @returns 페이지네이션된 투표 내역 (post 관계 포함)
   */
  async findMyVotes(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ResponseWithMeta<Vote[], PaginationMeta>> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.voteRepository.findAndCount({
      where: { userId },
      order: { firstVotedAt: 'DESC' },
      skip,
      take: limit,
      relations: ['post', 'post.creator'],
    });

    const totalPages = Math.ceil(total / limit);

    return new ResponseWithMeta(items, { total, page, limit, totalPages });
  }

  /**
   * 닉네임을 수정합니다.
   * @param userId - 사용자 ID
   * @param nickname - 새 닉네임
   * @returns 수정된 사용자 정보
   */
  async updateNickname(userId: string, nickname: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND });
    }

    const existing = await this.findByNickname(nickname);
    if (existing && existing.id !== userId) {
      throw new ConflictException({ code: ErrorCode.NICKNAME_ALREADY_EXISTS });
    }

    user.nickname = nickname;
    return this.userRepository.save(user);
  }
}
