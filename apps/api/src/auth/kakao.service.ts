import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  KakaoTokenResponse,
  KakaoUserInfo,
} from './interfaces/kakao-user.interface';

@Injectable()
export class KakaoService {
  private readonly kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';
  private readonly kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';

  constructor(private configService: ConfigService) {}

  /**
   * 카카오 인가 코드를 사용하여 액세스 토큰을 발급받습니다.
   * @param code - 카카오 OAuth 인가 코드
   * @returns 카카오 액세스 토큰 정보
   */
  async getKakaoToken(code: string): Promise<KakaoTokenResponse> {
    const clientId = this.configService.get<string>('KAKAO_CLIENT_ID');
    const redirectUri = this.configService.get<string>('KAKAO_REDIRECT_URI');

    console.log('=== 카카오 토큰 발급 요청 ===');
    console.log('Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    console.log('Code:', code);

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId!,
      redirect_uri: redirectUri!,
      code,
    });

    try {
      const response = await axios.post<KakaoTokenResponse>(
        this.kakaoTokenUrl,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('=== 카카오 토큰 발급 실패 ===');
        console.error('Status:', error.response?.status);
        console.error('Error Data:', error.response?.data);
        console.error('Error Message:', error.message);

        throw new UnauthorizedException(
          `카카오 토큰 발급에 실패했습니다: ${JSON.stringify(error.response?.data)}`,
        );
      }
      console.error('카카오 토큰 발급에 실패했습니다.', error);
      throw new UnauthorizedException(
        '카카오 토큰 발급에 실패했습니다.',
        error,
      );
    }
  }

  /**
   * 카카오 액세스 토큰을 사용하여 사용자 정보를 조회합니다.
   * @param accessToken - 카카오 액세스 토큰
   * @returns 카카오 사용자 정보
   */
  async getKakaoUserInfo(accessToken: string): Promise<KakaoUserInfo> {
    try {
      const response = await axios.get<KakaoUserInfo>(this.kakaoUserInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      return response.data;
    } catch (error) {
      throw new UnauthorizedException(
        '카카오 사용자 정보 조회에 실패했습니다.',
        error,
      );
    }
  }
}
