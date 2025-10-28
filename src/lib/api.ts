export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        email: string;
        userName: string;
        phone: string;
        role: string;
        isVerified: boolean;
    };
    token?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userName?: string;
  phone?: string;
  date_of_birth?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

class APIClient {
    private baseURL: string;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    }
  private buildUrl(endpoint: string) {
    // allow endpoint to be provided with or without leading slash
    if (endpoint.startsWith('http')) return endpoint;
    return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  private defaultHeaders(additional?: Record<string, string>) {
    return {
      'Content-Type': 'application/json',
      ...additional,
    };
  }

  async get<T>(endpoint: string, options?: { token?: string; includeCredentials?: boolean }): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);
            const headers: Record<string, string> = {};
            if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
            const response = await fetch(url, { method: 'GET', headers: this.defaultHeaders(headers), credentials: options?.includeCredentials ? 'include' : 'same-origin' });
      const result = await response.json();
      if (result?.success || response.ok) {
        return { data: result, success: true };
      }
      return { error: result?.message || 'Request failed', success: false };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please check if backend is running.', success: false };
    }
  }

  async post<T>(endpoint: string, data: LoginRequest | RegisterRequest, options?: { token?: string; includeCredentials?: boolean }): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const headers: Record<string, string> = {};
      if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.defaultHeaders(headers),
        body: JSON.stringify(data),
        credentials: options?.includeCredentials ? 'include' : 'same-origin',
      });

      const result = await response.json();

      if (result.success || response.ok) {
        return { data: result, success: true };
      } else {
        return { error: result.message || 'Request failed', success: false };
      }
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please check if backend is running.', success: false };
    }
  }

  async put<T>(endpoint: string, data: Record<string, unknown>, options?: { token?: string; includeCredentials?: boolean }): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(endpoint);
      const headers: Record<string, string> = {};
      if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.defaultHeaders(headers),
        body: JSON.stringify(data),
        credentials: options?.includeCredentials ? 'include' : 'same-origin',
      });
      const result = await response.json();
      if (result.success || response.ok) {
        return { data: result, success: true };
      }
      return { error: result?.message || 'Request failed', success: false };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please check if backend is running.', success: false };
    }
  }
}

export const apiClient = new APIClient();
import { API_ENDPOINTS } from '@/shared/constants/api';

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.REGISTER, userData);
  }
};

export const usersAPI = {
  // get current user's profile
  getMyProfile: async (token?: string, includeCredentials = true) => {
    const resp = await apiClient.get<unknown>(API_ENDPOINTS.USER_PROFILE, { token, includeCredentials });
    if (resp.success && resp.data) return resp;
    // fallback
    return apiClient.get<unknown>(API_ENDPOINTS.AUTH_PROFILE, { token, includeCredentials });
  },

  // update current user's profile
  updateMyProfile: async (payload: Record<string, unknown>, token?: string, includeCredentials = true) => {
    return apiClient.put<unknown>(API_ENDPOINTS.UPDATE_PROFILE, payload, { token, includeCredentials });
  },
};