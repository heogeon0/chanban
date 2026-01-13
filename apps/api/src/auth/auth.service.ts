import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CustomJwtPayload } from './interfaces/jwt-payload.interface';
import { KakaoService } from './kakao.service';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private kakaoService: KakaoService,
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  /**
   * 카카오 로그인을 처리합니다.
   * 신규 사용자: 회원가입을 위한 임시 토큰 발급
   * 기존 사용자: JWT 액세스 토큰과 리프레시 토큰 발급
   * @param code - 카카오 OAuth 인가 코드
   * @returns 회원가입 필요 여부에 따른 응답
   */
  async kakaoLogin(code: string) {
    // 1. 카카오 액세스 토큰 발급
    const kakaoToken = await this.kakaoService.getKakaoToken(code);

    // 2. 카카오 사용자 정보 조회
    const kakaoUserInfo = await this.kakaoService.getKakaoUserInfo(
      kakaoToken.access_token,
    );

    // 3. DB에서 사용자 조회
    const kakaoId = String(kakaoUserInfo.id);
    const user = await this.userService.findByKakaoId(kakaoId);
    console.log('user', user);

    // 4-A. 기존 사용자: 로그인 처리
    if (user) {
      const payload: CustomJwtPayload = {
        sub: user.id,
        kakaoId: user.kakaoId,
        nickname: user.nickname,
      };

      const accessToken = this.jwtService.sign(payload);

      // Refresh Token 발급 및 DB 저장
      const refreshTokenExpiresIn =
        this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN') ||
        7 * 24 * 60 * 60;
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: refreshTokenExpiresIn,
      });

      // Refresh Token을 DB에 저장
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후

      await this.refreshTokenService.create(user.id, refreshToken, expiresAt);

      return {
        needsSignup: false,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          nickname: user.nickname,
          profileImageUrl: user.profileImageUrl,
        },
      };
    }

    // 4-B. 신규 사용자: 임시 토큰 발급 (회원가입용)
    const tempPayload = {
      kakaoId,
      temp: true,
    };

    const tempToken = this.jwtService.sign(tempPayload, {
      expiresIn: '10m', // 10분간 유효
    });

    return {
      needsSignup: true,
      kakaoId,
      tempToken,
    };
  }

  /**
   * 회원가입을 처리하고 JWT 토큰을 발급합니다.
   * @param tempToken - 카카오 로그인 시 발급받은 임시 토큰
   * @param nickname - 사용자 닉네임
   * @param profileImageUrl - 프로필 이미지 URL (선택)
   * @returns JWT 액세스 토큰과 리프레시 토큰
   */
  async signup(tempToken: string, nickname: string, profileImageUrl?: string) {
    // 1. 임시 토큰 검증
    let tempPayload: { kakaoId: string; temp: boolean };
    try {
      tempPayload = this.jwtService.verify(tempToken);

      if (!tempPayload.temp || !tempPayload.kakaoId) {
        throw new UnauthorizedException('유효하지 않은 임시 토큰입니다.');
      }
    } catch (error) {
      throw new UnauthorizedException(
        '임시 토큰이 만료되었거나 유효하지 않습니다.',
      );
    }

    // 2. 이미 가입된 사용자인지 확인
    const existingUser = await this.userService.findByKakaoId(
      tempPayload.kakaoId,
    );
    if (existingUser) {
      throw new UnauthorizedException('이미 가입된 사용자입니다.');
    }

    // 3. 닉네임 중복 확인
    const existingNickname = await this.userService.findByNickname(nickname);
    if (existingNickname) {
      throw new UnauthorizedException('이미 사용 중인 닉네임입니다.');
    }

    // 4. 사용자 생성
    const user = await this.userService.create(
      tempPayload.kakaoId,
      nickname,
      profileImageUrl || null,
    );

    // 5. JWT 토큰 발급
    const payload: CustomJwtPayload = {
      sub: user.id,
      kakaoId: user.kakaoId,
      nickname: user.nickname,
    };

    const accessToken = this.jwtService.sign(payload);

    // Refresh Token 발급 및 DB 저장
    const refreshTokenExpiresIn =
      this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN') ||
      7 * 24 * 60 * 60;
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshTokenExpiresIn,
    });

    // Refresh Token을 DB에 저장
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후

    await this.refreshTokenService.create(user.id, refreshToken, expiresAt);

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
  async refreshAccessToken(refreshToken: string) {
    try {
      // 1. JWT 서명 검증
      const payload = this.jwtService.verify<CustomJwtPayload>(refreshToken);

      // 2. DB에서 토큰 존재 여부 확인
      const storedToken =
        await this.refreshTokenService.findByToken(refreshToken);

      if (!storedToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      if (storedToken.revokedAt) {
        throw new UnauthorizedException('무효화된 토큰입니다.');
      }

      // 3. 만료 확인
      if (new Date() > storedToken.expiresAt) {
        throw new UnauthorizedException('만료된 토큰입니다.');
      }

      // 4. 새 Access Token 발급
      const newPayload: CustomJwtPayload = {
        sub: payload.sub,
        kakaoId: payload.kakaoId,
        nickname: payload.nickname,
      };

      const accessToken = this.jwtService.sign(newPayload);

      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }
  }

  /**
   * 로그아웃을 처리합니다. (Refresh Token 무효화)
   * @param refreshToken - JWT 리프레시 토큰
   */
  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.deleteByToken(refreshToken);
  }

  /**
   * 특정 사용자의 모든 토큰을 무효화합니다.
   * @param userId - 사용자 ID
   */
  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAllByUserId(userId);
  }
}
