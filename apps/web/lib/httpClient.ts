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

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 30000;
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

      // 401 Unauthorized 에러 처리 (토큰 갱신)
      if (response.status === 401 && !skipAuth) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            // 토큰 갱신 시도
            const refreshResponse = await this.post<{ accessToken: string }>(
              '/auth/refresh',
              { refreshToken },
              { skipAuth: true }
            );

            // 새로운 액세스 토큰 저장
            setAccessToken(refreshResponse.accessToken);

            // 원래 요청 재시도
            return this.request<T>(url, config);
          } catch (refreshError) {
            // 토큰 갱신 실패 시 로그아웃 처리
            clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
          }
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
  baseURL: process.env.NEXT_PUBLIC_CAHNBAN_API || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});
