export enum LivestreamStatus {
  LIVE = 'LIVE',
  SCHEDULED = 'SCHEDULED',
  ENDED = 'ENDED'
}

export interface Livestream {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  streamUrl?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  status: LivestreamStatus;
  viewerCount: number;
  startTime?: Date;
  endTime?: Date;
  products: string[];
  channelName: string;
  productSummaries?: LivestreamProductSummary[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LivestreamProductSummary {
  id: string;
  name: string;
  price: number;
  unit?: string;
  thumbnail?: string;
  stockQuantity?: number;
}

export interface CreateLivestreamDto {
  title: string;
  description?: string;
  thumbnail?: string;
  products: string[];
  startTime?: Date;
}

export interface UpdateLivestreamDto {
  title?: string;
  description?: string;
  thumbnail?: string;
  products?: string[];
}

export interface AgoraToken {
  appId: string;
  token: string;
  uid: number;
  expiresAt: number;
}
