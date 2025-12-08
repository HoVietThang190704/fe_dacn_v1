import { Livestream, LivestreamStatus, CreateLivestreamDto, UpdateLivestreamDto, AgoraToken } from '../entities/Livestream';

export interface ILivestreamRepository {
  getLivestreams(status?: LivestreamStatus): Promise<Livestream[]>;
  getLivestreamById(id: string): Promise<Livestream>;
  getActiveLivestreams(): Promise<Livestream[]>;
  getScheduledLivestreams(): Promise<Livestream[]>;
  getUserHistory(userId: string): Promise<Livestream[]>;
  createLivestream(data: CreateLivestreamDto): Promise<Livestream>;
  updateLivestream(id: string, data: UpdateLivestreamDto): Promise<Livestream>;
  updateLivestreamStatus(id: string, status: LivestreamStatus): Promise<Livestream>;
  updateLivestreamProducts(id: string, pricing: UpdateLivestreamDto['productPricing']): Promise<Livestream>;
  getAgoraToken(channel: string, uid: number, role: 'publisher' | 'audience'): Promise<AgoraToken>;
}
