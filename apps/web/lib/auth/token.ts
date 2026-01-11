const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * 액세스 토큰을 로컬 스토리지에 저장합니다.
 * @param token - JWT 액세스 토큰
 */
export const setAccessToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
};

/**
 * 로컬 스토리지에서 액세스 토큰을 가져옵니다.
 * @returns JWT 액세스 토큰 또는 null
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

/**
 * 리프레시 토큰을 로컬 스토리지에 저장합니다.
 * @param token - JWT 리프레시 토큰
 */
export const setRefreshToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

/**
 * 로컬 스토리지에서 리프레시 토큰을 가져옵니다.
 * @returns JWT 리프레시 토큰 또는 null
 */
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

/**
 * 모든 토큰을 로컬 스토리지에서 제거합니다.
 */
export const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * 액세스 토큰과 리프레시 토큰을 모두 저장합니다.
 * @param accessToken - JWT 액세스 토큰
 * @param refreshToken - JWT 리프레시 토큰
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
};
