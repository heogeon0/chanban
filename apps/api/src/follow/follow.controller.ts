import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { FollowService } from './follow.service';

@Controller('users')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  /**
   * 특정 사용자를 팔로우합니다.
   */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/follow')
  @HttpCode(HttpStatus.CREATED)
  async follow(@Param('userId') userId: string, @CurrentUser() user: User) {
    await this.followService.follow(user.id, userId);
  }

  /**
   * 특정 사용자를 언팔로우합니다.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/follow')
  @HttpCode(HttpStatus.OK)
  async unfollow(@Param('userId') userId: string, @CurrentUser() user: User) {
    await this.followService.unfollow(user.id, userId);
  }

  /**
   * 특정 사용자에 대한 팔로우 여부를 조회합니다.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/follow-status')
  async getFollowStatus(@Param('userId') userId: string, @CurrentUser() user: User) {
    return this.followService.getFollowStatus(user.id, userId);
  }

  /**
   * 특정 사용자의 팔로워/팔로잉 수를 조회합니다.
   */
  @Get(':userId/follow-counts')
  async getFollowCounts(@Param('userId') userId: string) {
    return this.followService.getFollowCounts(userId);
  }

  /**
   * 특정 사용자의 팔로워 목록을 조회합니다.
   */
  @Get(':userId/followers')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.followService.getFollowers(userId, Number(page), Number(limit));
  }

  /**
   * 특정 사용자의 팔로잉 목록을 조회합니다.
   */
  @Get(':userId/following')
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.followService.getFollowing(userId, Number(page), Number(limit));
  }
}
