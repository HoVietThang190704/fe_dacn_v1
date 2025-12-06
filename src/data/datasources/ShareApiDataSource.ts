import { ShareInfo, ShareResourceType } from '@/domain/entities/ShareInfo';
import { API_ENDPOINTS } from '@/shared/constants/api';

interface ShareInfoPayload {
  resourceId: string;
  resourceType: ShareResourceType;
  shareUrl: string;
  qrCodeDataUrl: string;
  meta?: {
    title?: string;
    description?: string;
    thumbnail?: string;
  };
}

interface ShareInfoApiResponse {
  success?: boolean;
  message?: string;
  data?: ShareInfoPayload;
}

export class ShareApiDataSource {
  private readonly defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  constructor(private readonly baseUrl: string = '') {}

  async getPostShareInfo(postId: string, locale?: string): Promise<ShareInfo> {
    if (!postId) {
      throw new Error('Post ID is required');
    }
    return this.fetchShareInfo(API_ENDPOINTS.POST_SHARE_INFO(postId), locale);
  }

  async getProductShareInfo(productId: string, locale?: string): Promise<ShareInfo> {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    return this.fetchShareInfo(API_ENDPOINTS.PRODUCT_SHARE_INFO(productId), locale);
  }

  private async fetchShareInfo(path: string, locale?: string): Promise<ShareInfo> {
    const url = this.buildUrl(path, locale);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders,
      credentials: 'include',
    });

    const rawText = await response.text();
    let payload: ShareInfoApiResponse | undefined;
    try {
      payload = rawText ? (JSON.parse(rawText) as ShareInfoApiResponse) : undefined;
    } catch {
      payload = undefined;
    }

    if (!response.ok) {
      const message = payload?.message || rawText || response.statusText || 'Failed to fetch share info';
      throw new Error(message);
    }

    if (!payload?.data) {
      const message = payload?.message || 'Share info is unavailable. Please try again later.';
      throw new Error(message);
    }

    return this.transformShareInfo(payload.data);
  }

  private buildUrl(path: string, locale?: string): string {
    const normalizedBase = (this.baseUrl || '').replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const search = locale ? `?locale=${encodeURIComponent(locale)}` : '';
    return `${normalizedBase}${normalizedPath}${search}`;
  }

  private transformShareInfo(payload: ShareInfoPayload): ShareInfo {
    return {
      resourceId: payload.resourceId,
      resourceType: payload.resourceType,
      shareUrl: payload.shareUrl,
      qrCodeDataUrl: payload.qrCodeDataUrl,
      meta: payload.meta,
    };
  }
}
