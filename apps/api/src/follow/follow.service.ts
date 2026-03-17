import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';
import { User } from '../entities/user.entity';
import { ErrorCode } from '@chanban/shared-types';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 팔로우합니다.
   * 자기 자신 팔로우 및 중복 팔로우를 방지합니다.
   */
  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new BadRequestException({ code: ErrorCode.BAD_REQUEST, message: '자기 자신을 팔로우할 수 없습니다' });
    }

    const targetUser = await this.userRepository.findOne({ where: { id: followingId } });
    if (!targetUser) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND });
    }

    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existing) {
      throw new BadRequestException({ code: ErrorCode.BAD_REQUEST, message: '이미 팔로우한 사용자입니다' });
    }

    const follow = this.followRepository.create({ followerId, followingId });
    await this.followRepository.save(follow);
  }

  /**
   * 언팔로우합니다.
   */
  async unfollow(followerId: string, followingId: string): Promise<void> {
    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (!existing) {
      throw new NotFoundException({ code: ErrorCode.NOT_FOUND, message: '팔로우 관계가 존재하지 않습니다' });
    }

    await this.followRepository.delete({ followerId, followingId });
  }

  /**
   * 팔로우 여부를 확인합니다.
   * @returns `{ isFollowing: boolean }`
   */
  async getFollowStatus(followerId: string, followingId: string): Promise<{ isFollowing: boolean }> {
    const existing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    return { isFollowing: !!existing };
  }

  /**
   * 팔로워/팔로잉 수를 조회합니다.
   */
  async getFollowCounts(userId: string): Promise<{ followersCount: number; followingCount: number }> {
    const [followersCount, followingCount] = await Promise.all([
      this.followRepository.count({ where: { followingId: userId } }),
      this.followRepository.count({ where: { followerId: userId } }),
    ]);
    return { followersCount, followingCount };
  }

  /**
   * 팔로워 목록을 조회합니다.
   */
  async getFollowers(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const items = follows.map((f) => ({
      id: f.follower.id,
      nickname: f.follower.nickname,
      profileImageUrl: f.follower.profileImageUrl,
    }));

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * 팔로잉 목록을 조회합니다.
   */
  async getFollowing(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const items = follows.map((f) => ({
      id: f.following.id,
      nickname: f.following.nickname,
      profileImageUrl: f.following.profileImageUrl,
    }));

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
