/**
 * 카카오 로그인을 시작합니다.
 * JavaScript SDK 없이 직접 카카오 인증 페이지로 리다이렉트합니다.
 */
export const loginWithKakao = (): void => {
  if (typeof window === 'undefined') return;

  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

  if (!clientId) {
    console.error('Kakao Client ID is not defined');
    return;
  }

  if (!redirectUri) {
    console.error('Kakao Redirect URI is not defined');
    return;
  }

  // 카카오 OAuth 인증 URL로 직접 리다이렉트
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  window.location.href = kakaoAuthUrl;
};
