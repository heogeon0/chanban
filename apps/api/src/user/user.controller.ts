import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { ErrorCode } from '@chanban/shared-types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 내가 작성한 토픽 목록을 조회합니다.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/posts')
  async getMyPosts(
    @CurrentUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userService.findMyPosts(user.id, Number(page), Number(limit));
  }

  /**
   * 내 투표 내역을 조회합니다.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/votes')
  async getMyVotes(
    @CurrentUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userService.findMyVotes(user.id, Number(page), Number(limit));
  }

  /**
   * 닉네임을 수정합니다.
   */
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMe(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateNickname(user.id, updateUserDto.nickname);
  }

  /**
   * 특정 사용자가 작성한 댓글 목록을 조회합니다.
   */
  @Get(':id/comments')
  async getUserComments(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userService.findUserComments(id, Number(page), Number(limit));
  }

  /**
   * 특정 사용자의 공개 프로필을 조회합니다.
   */
  @Get(':id/profile')
  async getProfile(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException({ code: ErrorCode.USER_NOT_FOUND });
    }
    return {
      id: user.id,
      nickname: user.nickname,
      profileImageUrl: user.profileImageUrl,
    };
  }

  /**
   * 특정 사용자가 작성한 토픽 목록을 조회합니다.
   */
  @Get(':id/posts')
  async getUserPosts(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.userService.findMyPosts(id, Number(page), Number(limit));
  }
}
