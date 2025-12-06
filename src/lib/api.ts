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
  otp: string;
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

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  expiresAt?: string;
  devOtp?: string;
}

export interface ResetPasswordWithOtpRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordWithOtpResponse {
  success: boolean;
  message: string;
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
import type { SearchApiResponse } from '@/data/datasources/SearchApiDataSource';

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials);
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    return apiClient.post<RegisterResponse>(API_ENDPOINTS.REGISTER, userData);
  },

  sendEmailOTP: async (email: string): Promise<ApiResponse<{ expiresAt: string; devOtp?: string }>> => {
    return apiClient.post<{ expiresAt: string; devOtp?: string }>(API_ENDPOINTS.EMAIL_SEND_OTP, { email });
  },

  forgotPassword: async (email: string): Promise<ApiResponse<ForgotPasswordResponse>> => {
    return apiClient.post<ForgotPasswordResponse>(API_ENDPOINTS.PASSWORD_FORGOT, { email });
  },

  resetPasswordWithOtp: async (
    payload: ResetPasswordWithOtpRequest
  ): Promise<ApiResponse<ResetPasswordWithOtpResponse>> => {
    return apiClient.post<ResetPasswordWithOtpResponse>(API_ENDPOINTS.PASSWORD_RESET_WITH_OTP, payload);
  },
  // Exchange Google id_token for app tokens/user
  googleToken: async (idToken: string): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH_GOOGLE_TOKEN, { id_token: idToken });
  },

  // Exchange Facebook access_token for app tokens/user
  facebookToken: async (accessToken: string): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH_FACEBOOK_TOKEN, { access_token: accessToken });
  },

  // Exchange Firebase idToken (from client phone auth) for app access tokens
  firebaseVerify: async (idToken: string): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.PHONE_FIREBASE_VERIFY, { idToken });
  },

  // Send OTP to phone number
  sendOTP: async (phone: string): Promise<ApiResponse<{ expiresAt: string }>> => {
    return apiClient.post<{ expiresAt: string }>(API_ENDPOINTS.PHONE_SEND_OTP, { phone });
  },

  // Verify OTP and login
  verifyOTP: async (phone: string, otp: string): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.PHONE_VERIFY_OTP, { phone, otp });
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

const buildAbsoluteUrl = (endpoint: string) => {
  if (endpoint.startsWith('http')) return endpoint;
  const base = API_CONFIG.BASE_URL || '';
  return `${base}${endpoint}`;
};

export type ProductSuggestion = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

type SearchRequestParams = {
  productsLimit?: number;
  postsLimit?: number;
  usersLimit?: number;
};

export const searchApi = {
  async search(query: string, params?: SearchRequestParams): Promise<{ success: boolean; data?: SearchApiResponse; error?: string }> {
    const keyword = (query ?? '').trim();
    if (!keyword) {
      return { success: false, error: 'Keyword is required' };
    }

    const urlParams = new URLSearchParams({ q: keyword });
    if (params?.productsLimit) urlParams.set('productsLimit', String(params.productsLimit));
    if (params?.postsLimit) urlParams.set('postsLimit', String(params.postsLimit));
    if (params?.usersLimit) urlParams.set('usersLimit', String(params.usersLimit));

    const response = await fetch(`${buildAbsoluteUrl(API_ENDPOINTS.GLOBAL_SEARCH)}?${urlParams.toString()}`, {
      credentials: 'include'
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      return {
        success: false,
        error: payload?.message || 'Không thể tìm kiếm, vui lòng thử lại sau.'
      };
    }

    return {
      success: true,
      data: (payload?.data as SearchApiResponse) ?? payload
    };
  },

  async suggest(text: string, limit: number = 8): Promise<ProductSuggestion[]> {
    const keyword = (text ?? '').trim();
    if (keyword.length < 1) {
      return [];
    }

    const params = new URLSearchParams({ text: keyword, limit: String(limit) });
    const response = await fetch(`${buildAbsoluteUrl(API_ENDPOINTS.SEARCH_SUGGEST)}?${params.toString()}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json().catch(() => ({}));
    if (payload?.success === false) {
      return [];
    }

    return Array.isArray(payload?.data) ? (payload.data as ProductSuggestion[]) : [];
  }
};