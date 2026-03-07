/** 로그인 후 돌아갈 URL을 저장하는 키 */
export const RETURN_URL_KEY = "auth_return_url";

/** returnUrl에서 제외할 경로 패턴 */
const EXCLUDED_PATHS = ["/auth/login", "/auth/signup", "/auth/kakao"];

/**
 * 카카오 로그인을 시작합니다.
 * 현재 URL을 저장하고 카카오 인증 페이지로 이동합니다.
 */
export const loginWithKakao = (): void => {
  if (typeof window === "undefined") return;

  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;

  if (!clientId) {
    console.error("Kakao Client ID is not defined");
    return;
  }

  if (!redirectUri) {
    console.error("Kakao Redirect URI is not defined");
    return;
  }

  // returnUrl query param이 있으면 우선 사용 (로그인 페이지에서 목적지를 명시한 경우)
  // 없으면 현재 URL 저장 (인증 관련 경로 제외)
  const searchParams = new URLSearchParams(window.location.search);
  const returnUrlParam = searchParams.get("returnUrl");

  if (returnUrlParam) {
    localStorage.setItem(RETURN_URL_KEY, `${window.location.origin}${returnUrlParam}`);
  } else {
    const currentPath = window.location.pathname;
    const isExcludedPath = EXCLUDED_PATHS.some((path) => currentPath.startsWith(path));
    if (!isExcludedPath) {
      localStorage.setItem(RETURN_URL_KEY, window.location.href);
    }
  }

  // 카카오 OAuth 인증 URL로 이동
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

  window.location.href = kakaoAuthUrl;
};

/**
 * 저장된 returnUrl을 가져오고 삭제합니다.
 */
export const getAndClearReturnUrl = (): string => {
  if (typeof window === "undefined") return "/topics";

  const returnUrl = localStorage.getItem(RETURN_URL_KEY);
  localStorage.removeItem(RETURN_URL_KEY);

  // 유효한 URL인지 검증 (같은 origin만 허용)
  if (returnUrl) {
    try {
      const url = new URL(returnUrl);
      if (url.origin === window.location.origin) {
        return url.pathname + url.search;
      }
    } catch {
      // 잘못된 URL이면 기본값 사용
    }
  }

  return "/topics";
};
