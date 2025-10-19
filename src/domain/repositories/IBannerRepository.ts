import { Banner, Promotion } from '../entities/Banner';

export interface IBannerRepository {
  getActiveBanners(): Promise<Banner[]>;
  getActivePromotions(): Promise<Promotion[]>;
}
