import { RegisterShopOwnerRequest } from '@/domain/entities/RegisterShopOwnerRequest';
import { apiClient } from '@/lib/api';
import { API_CONFIG, API_ENDPOINTS } from '@/shared/constants/api';

export class RegisterShopOwnerApiDataSource {
  async getMyRequest(): Promise<RegisterShopOwnerRequest | null> {
    const token = this.getAuthToken();
    const response = await apiClient.get<{ data?: unknown }>(API_ENDPOINTS.REGISTER_SHOP_OWNER_ME, {
      token,
      includeCredentials: true
    });

    if (!response.success) {
      throw new Error(response.error || 'Unable to load register request');
    }

    const raw = this.unwrapResponse(response.data);
    if (!raw) {
      return null;
    }
    return this.mapToEntity(raw as Record<string, unknown>);
  }

  async submitRequest(file: File): Promise<RegisterShopOwnerRequest> {
    if (!file) {
      throw new Error('Certificate is required');
    }

    const token = this.getAuthToken();
    const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.REGISTER_SHOP_OWNER}`;
    const formData = new FormData();
    formData.append('certificate', file);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      credentials: 'include'
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.success === false) {
      const message = result?.message || 'Unable to submit request';
      throw new Error(message);
    }

    const data = this.unwrapResponse(result?.data ?? result);
    if (!data) {
      throw new Error('Unexpected response from server');
    }

    return this.mapToEntity(data as Record<string, unknown>);
  }

  private unwrapResponse(payload: unknown) {
    if (!payload) {
      return null;
    }

    if (Array.isArray(payload)) {
      return payload[0] ?? null;
    }

    if (typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      if (Object.prototype.hasOwnProperty.call(record, 'data')) {
        const inner = record.data;
        if (!inner) {
          return null;
        }
        if (Array.isArray(inner)) {
          return inner[0] ?? null;
        }
        return inner;
      }
    }

    return payload;
  }

  private mapToEntity(raw: Record<string, unknown>): RegisterShopOwnerRequest {
    const id = String(raw.id || raw._id || '');
    if (!id) {
      throw new Error('Invalid register request payload');
    }
    return {
      id,
      userId: String(raw.userId || raw.user_id || ''),
      certificateUrl: String(raw.certificateUrl || ''),
      status: (raw.status as RegisterShopOwnerRequest['status']) || 'pending',
      reviewMessage: (raw.reviewMessage as string) ?? null,
      reviewedBy: (raw.reviewedBy as string) ?? null,
      reviewedAt: raw.reviewedAt ? String(raw.reviewedAt) : null,
      createdAt: String(raw.createdAt || new Date().toISOString()),
      updatedAt: String(raw.updatedAt || new Date().toISOString()),
      userSnapshot: (raw.userSnapshot as Record<string, unknown> | undefined) ?? null
    };
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
}
