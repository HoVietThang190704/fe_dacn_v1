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

    async post<T>(endpoint: string, data: LoginRequest | RegisterRequest): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return { data: result, success: true };
      } else {
        return { error: result.message || 'Request failed', success: false };
      }
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please check if backend is running.', success: false };
    }
  }
}

export const apiClient = new APIClient();

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>('/api/auth/login', credentials);
  },
  
  register: async (userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post<LoginResponse>('/api/auth/register', userData);
  }
};