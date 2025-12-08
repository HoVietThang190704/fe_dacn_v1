import { ILivestreamRepository } from '@/domain/repositories/ILivestreamRepository';
import { Livestream, LivestreamStatus, CreateLivestreamDto, UpdateLivestreamDto, AgoraToken } from '@/domain/entities/Livestream';
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

  async getUserHistory(userId: string): Promise<Livestream[]> {
    return await this.apiDataSource.getUserHistory(userId);
  }

  async createLivestream(data: CreateLivestreamDto): Promise<Livestream> {
    return await this.apiDataSource.createLivestream(data);
  }

  async updateLivestream(id: string, data: UpdateLivestreamDto): Promise<Livestream> {
    return await this.apiDataSource.updateLivestream(id, data);
  }

  async updateLivestreamStatus(id: string, status: LivestreamStatus): Promise<Livestream> {
    return await this.apiDataSource.updateLivestreamStatus(id, status);
  }

  async getAgoraToken(channel: string, uid: number, role: 'publisher' | 'audience'): Promise<AgoraToken> {
    return await this.apiDataSource.getAgoraToken(channel, uid, role);
  }

  async updateLivestreamProducts(id: string, pricing: Livestream['productPricing']): Promise<Livestream> {
    return await this.apiDataSource.updateLivestreamProducts(id, pricing);
  }
}
