import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CustomJwtPayload } from './interfaces/jwt-payload.interface';
import { KakaoService } from './kakao.service';

@Injectable()
export class AuthService {
  constructor(
    private kakaoService: KakaoService,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 카카오 로그인을 처리하고 JWT 토큰을 발급합니다.
   * @param code - 카카오 OAuth 인가 코드
   * @returns JWT 액세스 토큰과 리프레시 토큰
   */
  async kakaoLogin(code: string) {
    // 1. 카카오 액세스 토큰 발급
    const kakaoToken = await this.kakaoService.getKakaoToken(code);

    // 2. 카카오 사용자 정보 조회
    const kakaoUserInfo = await this.kakaoService.getKakaoUserInfo(
      kakaoToken.access_token,
    );

    // 3. DB에서 사용자 조회 또는 생성
    const kakaoId = String(kakaoUserInfo.id);
    let user = await this.userService.findByKakaoId(kakaoId);

    if (!user) {
      console.log('kakaoUserInfo', kakaoUserInfo);
      const nickname = '사용자';
      const profileImageUrl = null;

      user = await this.userService.create(kakaoId, nickname, profileImageUrl);
    }

    // 4. JWT 토큰 발급
    const payload: CustomJwtPayload = {
      sub: user.id,
      kakaoId: user.kakaoId,
      nickname: user.nickname,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN') ||
        7 * 24 * 60 * 60,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        profileImageUrl: user.profileImageUrl,
      },
    };
  }

  /**
   * 리프레시 토큰으로 새로운 액세스 토큰을 발급합니다.
   * @param refreshToken - JWT 리프레시 토큰
   * @returns 새로운 액세스 토큰
   */
  refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<CustomJwtPayload>(refreshToken);

      const newPayload: CustomJwtPayload = {
        sub: payload.sub,
        kakaoId: payload.kakaoId,
        nickname: payload.nickname,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException(
        '유효하지 않은 리프레시 토큰입니다.',
        error,
      );
    }
  }
}
