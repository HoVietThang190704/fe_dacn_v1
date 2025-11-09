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
    const results = await Promise.allSettled([
      this.bannerRepository.getActiveBanners(),
      this.productRepository.getCategories(),
      this.productRepository.getBestSellingProducts(10),
      this.productRepository.getNewProducts(10),
      this.bannerRepository.getActivePromotions(),
    ]);

    const [bannersResult, categoriesResult, bestSellingResult, newProductsResult, promotionsResult] = results;

    const extract = <T>(result: PromiseSettledResult<T>, fallback: T): T => {
      if (result.status === 'fulfilled') {
        return result.value ?? fallback;
      }
      console.warn('[GetHomeDataUseCase] Falling back due to fetch error:', result.reason);
      return fallback;
    };

    const banners = extract<Banner[]>(bannersResult, []);
    const categories = extract<ProductCategory[]>(categoriesResult, []);
    const bestSellingProducts = extract<Product[]>(bestSellingResult, []);
    const newProducts = extract<Product[]>(newProductsResult, []);
    const promotions = extract<Promotion[]>(promotionsResult, []);

    if (!banners.length && !categories.length && !bestSellingProducts.length && !newProducts.length && !promotions.length) {
      throw new Error('Failed to load home data');
    }

    return {
      banners,
      categories,
      bestSellingProducts,
      newProducts,
      promotions,
    };
  }
}
