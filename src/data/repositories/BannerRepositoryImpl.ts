import { IBannerRepository } from '@/domain/repositories/IBannerRepository';
import { Banner, Promotion } from '@/domain/entities/Banner';
import { BannerApiDataSource } from '../datasources/BannerApiDataSource';

export class BannerRepositoryImpl implements IBannerRepository {
  constructor(private apiDataSource: BannerApiDataSource) {}

  async getActiveBanners(): Promise<Banner[]> {
    return await this.apiDataSource.getActiveBanners();
  }

  async getActivePromotions(): Promise<Promotion[]> {
    return await this.apiDataSource.getActivePromotions();
  }
}
