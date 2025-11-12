import { API_ENDPOINTS } from '@/shared/constants/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

interface RefreshResponse {
  success: boolean;
  message: string;
  accessToken?: string;
}

class AuthApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) return endpoint;
    return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  private getAuthToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return (
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      undefined
    );
  }

  private getRefreshToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return localStorage.getItem('refreshToken') || undefined;
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefreshToken();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn('[AuthApiClient] No refresh token available');
      return null;
    }

    try {
      const response = await fetch(this.buildUrl(API_ENDPOINTS.REFRESH_TOKEN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      const result: RefreshResponse = await response.json();

      if (result.success && result.accessToken) {
        this.setAuthToken(result.accessToken);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'authToken',
            newValue: result.accessToken,
            oldValue: localStorage.getItem('authToken'),
          }));
        }
        console.log('[AuthApiClient] Token refreshed successfully');
        return result.accessToken;
      } else {
        console.warn('[AuthApiClient] Token refresh failed:', result.message);
        return null;
      }
    } catch (error) {
      console.error('[AuthApiClient] Token refresh error:', error);
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { skipAuth?: boolean } = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (!options.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    let response = await fetch(url, requestOptions);
    if (response.status === 401 && !options.skipAuth && !this.isRefreshing) {
      console.log('[AuthApiClient] Got 401, attempting token refresh');
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...requestOptions,
          headers,
        });
      }
    }

    const rawText = await response.text();
    let payload: unknown;
    try {
      payload = rawText ? JSON.parse(rawText) : undefined;
    } catch {
      payload = undefined;
    }

    if (!response.ok) {
      const message =
        (payload && typeof payload === 'object' && 'message' in payload
          ? (payload as { message?: string }).message
          : undefined) || rawText || response.statusText || 'Request failed';
      return { error: message, success: false };
    }

    return { data: payload as T, success: true };
  }

  async get<T>(endpoint: string, options?: RequestInit & { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown, options?: RequestInit & { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown, options?: RequestInit & { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit & { skipAuth?: boolean }): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const authApiClient = new AuthApiClient();