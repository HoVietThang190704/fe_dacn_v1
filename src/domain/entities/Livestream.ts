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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLivestreamDto {
  title: string;
  description?: string;
  thumbnail?: string;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  products?: string[];
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
