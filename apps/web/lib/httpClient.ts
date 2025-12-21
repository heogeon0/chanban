type RequestConfig = RequestInit & {
  params?: Record<string, string | number | boolean>;
};

interface HttpClientConfig {
  baseURL?: string;
  headers?: HeadersInit;
  timeout?: number;
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
    const { params, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.buildURL(url, params), {
        ...fetchConfig,
        headers: {
          ...this.defaultHeaders,
          ...fetchConfig.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
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
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});
