export interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
  id_token?: string; // OpenID Connect 사용 시
}

export interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties?: {
    // Deprecated: 2021년 6월 25일 이후 사용 권장하지 않음
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    profile_nickname_needs_agreement?: boolean;
    profile_image_needs_agreement?: boolean;
    profile?: {
      nickname: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
    // 추가 가능한 필드들 (사용자 동의 시)
    email?: string;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    name?: string;
    name_needs_agreement?: boolean;
  };
}
