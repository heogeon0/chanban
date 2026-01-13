export interface User {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
}

/**
 * 카카오 로그인 응답 - 회원가입 필요
 */
export interface AuthResponseNeedsSignup {
  needsSignup: true;
  kakaoId: string;
  tempToken: string;
}

/**
 * 카카오 로그인 응답 - 로그인 완료
 */
export interface AuthResponseComplete {
  needsSignup: false;
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * 카카오 로그인 응답 (Discriminated Union)
 */
export type AuthResponse = AuthResponseNeedsSignup | AuthResponseComplete;
