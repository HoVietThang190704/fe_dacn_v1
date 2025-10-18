/**
 * Domain Repository Interface
 * Defines contract for banner and promotion data access
 */
import { Banner, Promotion } from '../entities/Banner';

export interface IBannerRepository {
  getActiveBanners(): Promise<Banner[]>;
  getActivePromotions(): Promise<Promotion[]>;
}
