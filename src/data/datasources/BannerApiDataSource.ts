/**
 * Data Source: Banner API
 * Handles HTTP requests to banner and promotion endpoints
 */
import { Banner, Promotion } from '@/domain/entities/Banner';

export class BannerApiDataSource {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getActiveBanners(): Promise<Banner[]> {
    const response = await fetch(`${this.baseUrl}/banners/active`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch banners: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const response = await fetch(`${this.baseUrl}/promotions/active`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch promotions: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
