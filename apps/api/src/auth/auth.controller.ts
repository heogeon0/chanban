import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { KakaoLoginDto } from './dto/kakao-login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('kakao/login')
  @HttpCode(HttpStatus.OK)
  async kakaoLogin(@Body() kakaoLoginDto: KakaoLoginDto) {
    return this.authService.kakaoLogin(kakaoLoginDto.code);
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(
      signupDto.tempToken,
      signupDto.nickname,
      signupDto.profileImageUrl,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
    return { message: '로그아웃되었습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}
