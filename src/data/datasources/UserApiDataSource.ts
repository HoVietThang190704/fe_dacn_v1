import { User, UpdateUserDto, UserAddress, ChangePasswordDto } from '@/domain/entities/User';
import { apiClient, ChangePasswordRequest } from '@/lib/api';
import { API_CONFIG, API_ENDPOINTS } from '@/shared/constants/api';

type RawUser = Record<string, unknown>;

export class UserApiDataSource {
  constructor() {}

  async getUserProfile(userId: string): Promise<User> {
    const token = this.getAuthToken();
    const response = await apiClient.get<unknown>(API_ENDPOINTS.USER_PROFILE, {
      token,
      includeCredentials: true,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch user profile');
    }

    const raw = this.extractUserPayload(response.data, userId);
    return this.mapToUser(raw, userId);
  }

  async updateUserProfile(userId: string, updates: UpdateUserDto): Promise<User> {
    const token = this.getAuthToken();
    const payload = this.normalizeUpdatePayload(updates);

    const response = await apiClient.put<unknown>(API_ENDPOINTS.UPDATE_PROFILE, payload, {
      token,
      includeCredentials: true,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update user profile');
    }

    const raw = this.extractUserPayload(response.data, userId);
    return this.mapToUser(raw, userId);
  }

  async uploadAvatar(file: File): Promise<string> {
    const token = this.getAuthToken();
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.UPLOAD_AVATAR}`;
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      let message = 'Failed to upload avatar';
      try {
        const error = await response.json();
        message = (error?.message as string) || message;
      } catch {
        // noop
      }
      throw new Error(message);
    }

    const result = await response.json();
    const payload = this.extractUserPayload(result, '');
    const avatarUrl = (payload.avatar as string)
      || (result?.data?.avatar as string)
      || (result?.data?.avatarUrl as string)
      || (result?.avatarUrl as string)
      || (result?.avatar as string);

    if (!avatarUrl) {
      throw new Error('Avatar URL not returned by server');
    }

    return avatarUrl;
  }

  async changePassword(data: ChangePasswordDto): Promise<void> {
    const token = this.getAuthToken();
    const request: ChangePasswordRequest = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    };
    const response = await apiClient.post<unknown>(API_ENDPOINTS.CHANGE_PASSWORD, request, {
      token,
      includeCredentials: true,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }
  }

  private getAuthToken(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    return (
      localStorage.getItem('authToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      undefined
    ) || undefined;
  }

  private extractUserPayload(payload: unknown, fallbackId: string): RawUser {
    if (!payload || typeof payload !== 'object') {
      return { id: fallbackId };
    }

    const root = payload as Record<string, unknown>;

    if (root.data && typeof root.data === 'object') {
      return root.data as RawUser;
    }

    if (root.user && typeof root.user === 'object') {
      return root.user as RawUser;
    }

    return root;
  }

  private mapToUser(raw: RawUser, fallbackId: string): User {
    const id = (raw.id as string) || (raw._id as string) || fallbackId;

    if (!id) {
      throw new Error('Invalid user data: missing id');
    }

    const address = this.mapAddress(raw.address);

    return {
      id,
      email: (raw.email as string) || '',
      userName: (raw.userName as string) || undefined,
      phone: (raw.phone as string) || undefined,
      avatar: (raw.avatar as string) || undefined,
      address,
      role: (raw.role as string) || undefined,
      isVerified: typeof raw.isVerified === 'boolean' ? (raw.isVerified as boolean) : undefined,
      dateOfBirth: this.normalizeDate(raw.dateOfBirth || raw.date_of_birth),
      createdAt: this.normalizeDate(raw.createdAt),
      updatedAt: this.normalizeDate(raw.updatedAt),
    };
  }

  private mapAddress(value: unknown): UserAddress | null | undefined {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    const source = value as Record<string, unknown>;
    const address: UserAddress = {
      province: this.normalizeString(source.province),
      district: this.normalizeString(source.district),
      commune: this.normalizeString(source.commune || source.ward),
      street: this.normalizeString(source.street),
      detail: this.normalizeString(source.detail || source.address),
    };

    const hasValue = Object.values(address).some(Boolean);
    return hasValue ? address : null;
  }

  private normalizeString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private normalizeDate(value: unknown): string | undefined {
    if (!value) return undefined;
    const dateString = typeof value === 'string' ? value : value instanceof Date ? value.toISOString() : undefined;
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  private normalizeUpdatePayload(updates: UpdateUserDto): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (updates.userName !== undefined) {
      const name = updates.userName.trim();
      if (name) {
        payload.userName = name;
      }
    }

    if (updates.phone !== undefined) {
      const phone = updates.phone.trim();
      if (phone) {
        payload.phone = phone;
      }
    }

    if (updates.dateOfBirth !== undefined) {
      payload.date_of_birth = updates.dateOfBirth
        ? new Date(updates.dateOfBirth).toISOString()
        : null;
    }

    if (updates.avatar !== undefined) {
      payload.avatar = updates.avatar;
    }

    if (updates.address !== undefined) {
      payload.address = this.normalizeAddressPayload(updates.address);
    }

    return payload;
  }

  private normalizeAddressPayload(address: UserAddress | null | undefined): UserAddress | null {
    if (address === null) {
      return null;
    }

    if (!address || typeof address !== 'object') {
      return null;
    }

    const sanitized: UserAddress = {
      province: this.normalizeString(address.province),
      district: this.normalizeString(address.district),
      commune: this.normalizeString(address.commune),
      street: this.normalizeString(address.street),
      detail: this.normalizeString(address.detail),
    };

    const hasValue = Object.values(sanitized).some(Boolean);
    return hasValue ? sanitized : null;
  }
}