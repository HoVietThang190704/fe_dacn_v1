export enum LivestreamStatus {
  LIVE = 'LIVE',
  SCHEDULED = 'SCHEDULED',
  ENDED = 'ENDED'
}

export interface Livestream {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  streamUrl: string;
  hostName: string;
  hostAvatar: string;
  status: LivestreamStatus;
  viewerCount: number;
  startTime: Date;
  endTime?: Date;
  products: string[]; // Product IDs
}
