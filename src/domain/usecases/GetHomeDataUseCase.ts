/**
 * Use Case: Get Home Page Data
 * Orchestrates multiple repository calls for home page
 */
import { IProductRepository } from '../repositories/IProductRepository';
import { IBannerRepository } from '../repositories/IBannerRepository';
import { Product, ProductCategory } from '../entities/Product';
import { Banner, Promotion } from '../entities/Banner';

export interface HomePageData {
  banners: Banner[];
  categories: ProductCategory[];
  bestSellingProducts: Product[];
  newProducts: Product[];
  promotions: Promotion[];
}

export class GetHomeDataUseCase {
  constructor(
    private productRepository: IProductRepository,
    private bannerRepository: IBannerRepository
  ) {}

  async execute(): Promise<HomePageData> {
    // Fetch all data in parallel for better performance
    const [banners, categories, bestSellingProducts, newProducts, promotions] = await Promise.all([
      this.bannerRepository.getActiveBanners(),
      this.productRepository.getCategories(),
      this.productRepository.getBestSellingProducts(10),
      this.productRepository.getNewProducts(10),
      this.bannerRepository.getActivePromotions()
    ]);

    return {
      banners,
      categories,
      bestSellingProducts,
      newProducts,
      promotions
    };
  }
}
