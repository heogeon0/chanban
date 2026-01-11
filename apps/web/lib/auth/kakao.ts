declare global {
  interface Window {
    Kakao: {
      init: (appKey: string) => void;
      isInitialized: () => boolean;
      Auth: {
        authorize: (options: {
          redirectUri: string;
          state?: string;
        }) => void;
      };
    };
  }
}

/**
 * 카카오 SDK를 초기화합니다.
 */
export const initKakao = (): void => {
  if (typeof window === 'undefined') return;

  const kakaoAppKey = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;

  if (!kakaoAppKey) {
    console.error('Kakao App Key is not defined');
    return;
  }

  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(kakaoAppKey);
  }
};

/**
 * 카카오 로그인을 시작합니다.
 */
export const loginWithKakao = (): void => {
  if (typeof window === 'undefined') return;

  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

  if (!redirectUri) {
    console.error('Kakao Redirect URI is not defined');
    return;
  }

  if (!window.Kakao || !window.Kakao.isInitialized()) {
    initKakao();
  }

  window.Kakao.Auth.authorize({
    redirectUri,
  });
};
