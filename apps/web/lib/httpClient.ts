import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from './auth/token';

type RequestConfig = RequestInit & {
  params?: Record<string, string | number | boolean>;
  skipAuth?: boolean;
};

interface HttpClientConfig {
  baseURL?: string;
  headers?: HeadersInit;
  timeout?: number;
}

/**
 * HTTP 에러 클래스
 * API 에러 응답의 status와 message를 포함합니다.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * HttpError 타입 가드
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

class HttpClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private timeout: number;
  /** refresh 중이면 하나의 Promise를 공유해서 thundering herd 방지 */
  private refreshPromise: Promise<string> | null = null;

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 30000;
  }

  /**
   * 토큰 갱신 — 동시에 여러 요청이 401을 받아도 refresh는 1회만 실행.
   * 나머지 요청은 같은 Promise를 공유해서 대기.
   * @returns 새 accessToken, 또는 갱신 실패 시 null (로그아웃 처리됨)
   */
  private async refreshAccessToken(): Promise<string | null> {
    // 이미 갱신 중이면 기존 Promise 재사용
    if (this.refreshPromise) {
      try {
        return await this.refreshPromise;
      } catch {
        return null;
      }
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return null;
    }

    this.refreshPromise = this.post<{ accessToken: string }>(
      '/api/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    )
      .then((res) => {
        setAccessToken(res.accessToken);
        return res.accessToken;
      })
      .catch(() => {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private buildURL(url: string, params?: Record<string, string | number | boolean>): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    if (!params) return fullURL;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    const separator = fullURL.includes('?') ? '&' : '?';
    return `${fullURL}${separator}${searchParams.toString()}`;
  }

  private async request<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, skipAuth, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      // JWT 토큰을 헤더에 추가
      const headers: HeadersInit & { Authorization?: string } = {
        ...this.defaultHeaders,
        ...fetchConfig.headers,
      };

      if (!skipAuth) {
        const token = getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(this.buildURL(url, params), {
        ...fetchConfig,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 401 Unauthorized — 토큰 갱신 후 1회만 재시도
      if (response.status === 401 && !skipAuth) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          // 재시도는 skipAuth로 무한 루프 차단
          return this.request<T>(url, { ...config, skipAuth: true, headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          }});
        }
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody.message || response.statusText;
        throw new HttpError(response.status, message);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  post<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  put<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }

  delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  patch<T, D = unknown>(url: string, data?: D, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    });
  }
}

// Factory function like axios.create()
export const createHttpClient = (config?: HttpClientConfig) => {
  return new HttpClient(config);
};

// Default instance
export const httpClient = createHttpClient({
  baseURL: process.env.NEXT_PUBLIC_CHANBAN_API || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});
