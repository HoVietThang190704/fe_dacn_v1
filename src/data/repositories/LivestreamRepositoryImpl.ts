/**
 * Repository Implementation: Livestream
 * Implements domain repository interface using data sources
 */
import { ILivestreamRepository } from '@/domain/repositories/ILivestreamRepository';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';
import { LivestreamApiDataSource } from '../datasources/LivestreamApiDataSource';

export class LivestreamRepositoryImpl implements ILivestreamRepository {
  constructor(private apiDataSource: LivestreamApiDataSource) {}

  async getLivestreams(status?: LivestreamStatus): Promise<Livestream[]> {
    return await this.apiDataSource.getLivestreams(status);
  }

  async getLivestreamById(id: string): Promise<Livestream> {
    return await this.apiDataSource.getLivestreamById(id);
  }

  async getActiveLivestreams(): Promise<Livestream[]> {
    return await this.apiDataSource.getActiveLivestreams();
  }

  async getScheduledLivestreams(): Promise<Livestream[]> {
    return await this.apiDataSource.getScheduledLivestreams();
  }
}
