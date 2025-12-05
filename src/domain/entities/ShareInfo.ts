export type ShareResourceType = 'post' | 'product';

export interface ShareInfoMeta {
  title?: string;
  description?: string;
  thumbnail?: string;
}

export interface ShareInfo {
  resourceId: string;
  resourceType: ShareResourceType;
  shareUrl: string;
  qrCodeDataUrl: string;
  meta?: ShareInfoMeta;
}
