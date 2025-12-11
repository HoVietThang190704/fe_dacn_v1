import { ShareInfo, ShareResourceType } from '@/domain/entities/ShareInfo';
import { API_ENDPOINTS } from '@/shared/constants/api';

const normalizeBaseUrl = (value?: string | null) => {
  if (!value) return '';
  return value.replace(/\/$/, '');
};

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
    const normalizedShareUrl = this.normalizeShareUrl(payload.shareUrl);
    return {
      resourceId: payload.resourceId,
      resourceType: payload.resourceType,
      shareUrl: normalizedShareUrl,
      qrCodeDataUrl: this.normalizeQrCode(payload.qrCodeDataUrl, normalizedShareUrl),
      meta: payload.meta,
    };
  }

  private normalizeShareUrl(url: string): string {
    const envBase = normalizeBaseUrl(process.env.NEXT_PUBLIC_WEB_URL || (process.env as Record<string, string | undefined>).NEXT_PUBLIC_FRONTEND_URL);
    const runtimeBase = typeof window !== 'undefined' ? normalizeBaseUrl(window.location.origin) : '';
    const targetBase = envBase || runtimeBase;
    if (!targetBase) return url;

    try {
      const parsed = new URL(url);
      const target = new URL(targetBase.startsWith('http') ? targetBase : `https://${targetBase}`);
      parsed.protocol = target.protocol;
      parsed.host = target.host;
      return parsed.toString();
    } catch {
      return url;
    }
  }

  private normalizeQrCode(qrCodeDataUrl: string, shareUrl: string): string {
    try {
      const qrUrl = new URL(shareUrl);
      // If QR was generated for localhost, rebuild it using the normalized share URL.
      if (qrCodeDataUrl.includes('localhost')) {
        return this.buildQrImageUrl(qrUrl.toString());
      }
      return qrCodeDataUrl;
    } catch {
      return qrCodeDataUrl;
    }
  }

  private buildQrImageUrl(data: string): string {
    const encoded = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encoded}`;
  }
}
