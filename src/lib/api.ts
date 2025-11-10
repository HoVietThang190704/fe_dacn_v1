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
    accessToken?: string;
    refreshToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userName?: string;
  phone?: string;
  date_of_birth?: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        email: string;
        userName: string;
        phone?: string;
        role: string;
        address?: Record<string, unknown>;
    };
    accessToken?: string;
    refreshToken?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

class APIClient {
    private baseURL: string;
    private isRefreshing = false;
    private refreshPromise: Promise<boolean> | null = null;

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
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

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(this.buildUrl(API_ENDPOINTS.REFRESH_TOKEN), {
        method: 'POST',
        headers: this.defaultHeaders(),
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      const result = await response.json();
      if (result.success && result.accessToken) {
        localStorage.setItem('authToken', result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: {
      data?: unknown;
      token?: string;
      includeCredentials?: boolean;
      retryOn401?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { data, token, includeCredentials = false, retryOn401 = true } = options;

    const url = this.buildUrl(endpoint);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const fetchOptions: RequestInit = {
      method,
      headers: this.defaultHeaders(headers),
      credentials: includeCredentials ? 'include' : 'same-origin',
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, fetchOptions);
      const result = await response.json();

      if (response.status === 401 && retryOn401 && !endpoint.includes('/auth/')) {
        // Token expired, try to refresh
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshPromise = this.refreshToken().finally(() => {
            this.isRefreshing = false;
            this.refreshPromise = null;
          });
        }

        const refreshSuccess = await this.refreshPromise;
        if (refreshSuccess) {
          // Retry with new token
          const newToken = localStorage.getItem('authToken');
          return this.makeRequest<T>(method, endpoint, {
            ...options,
            token: newToken || token,
            retryOn401: false, // Don't retry again
          });
        } else {
          // Refresh failed, logout
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return { error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', success: false };
        }
      }

      if (result?.success || response.ok) {
        return { data: result, success: true };
      }
      return { error: result?.message || 'Request failed', success: false };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please check if backend is running.', success: false };
    }
  }

  async get<T>(endpoint: string, options?: { token?: string; includeCredentials?: boolean }): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, options);
  }

  async post<T>(endpoint: string, data: unknown, options?: { token?: string; includeCredentials?: boolean }): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, { ...options, data });
  }

  async put<T>(endpoint: string, data: Record<string, unknown>, options?: { token?: string; includeCredentials?: boolean }): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, { ...options, data });
  }

  async delete<T>(endpoint: string, options?: { token?: string; includeCredentials?: boolean }): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, options);
  }
}

export const apiClient = new APIClient();
import { API_ENDPOINTS, API_CONFIG } from '@/shared/constants/api';

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.REGISTER, userData);
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

  // get user addresses
  getUserAddresses: async (token?: string, includeCredentials = true) => {
    return apiClient.get<unknown>(API_ENDPOINTS.USER_ADDRESSES, { token, includeCredentials });
  },

  // create new address
  createAddress: async (addressData: Record<string, unknown>, token?: string, includeCredentials = true) => {
    return apiClient.post<unknown>(API_ENDPOINTS.USER_ADDRESSES, addressData, { token, includeCredentials });
  },

  // update address
  updateAddress: async (addressId: string, addressData: Record<string, unknown>, token?: string, includeCredentials = true) => {
    return apiClient.put<unknown>(API_ENDPOINTS.USER_ADDRESS_DETAIL(addressId), addressData, { token, includeCredentials });
  },

  // delete address
  deleteAddress: async (addressId: string, token?: string, includeCredentials = true) => {
    return apiClient.delete<unknown>(API_ENDPOINTS.USER_ADDRESS_DETAIL(addressId), { token, includeCredentials });
  },

  // set default address
  setDefaultAddress: async (addressId: string, token?: string, includeCredentials = true) => {
    return apiClient.put<unknown>(API_ENDPOINTS.SET_DEFAULT_ADDRESS(addressId), {}, { token, includeCredentials });
  },
};