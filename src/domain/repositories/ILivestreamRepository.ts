import { Livestream, LivestreamStatus } from '../entities/Livestream';

export interface ILivestreamRepository {
  getLivestreams(status?: LivestreamStatus): Promise<Livestream[]>;
  getLivestreamById(id: string): Promise<Livestream>;
  getActiveLivestreams(): Promise<Livestream[]>;
  getScheduledLivestreams(): Promise<Livestream[]>;
}
