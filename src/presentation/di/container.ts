/**
 * Dependency Injection Container
 * Manages creation and lifecycle of dependencies
 */
import { API_CONFIG } from '@/shared/constants/api';

// Data Sources
import { ProductApiDataSource } from '@/data/datasources/ProductApiDataSource';
import { BannerApiDataSource } from '@/data/datasources/BannerApiDataSource';
import { OrderApiDataSource } from '@/data/datasources/OrderApiDataSource';
import { FavoriteApiDataSource } from '@/data/datasources/FavoriteApiDataSource';
import { LivestreamApiDataSource } from '@/data/datasources/LivestreamApiDataSource';
import { CommunityApiDataSource } from '@/data/datasources/CommunityApiDataSource';
import { SupportApiDataSource } from '@/data/datasources/SupportApiDataSource';

// Repositories
import { ProductRepositoryImpl } from '@/data/repositories/ProductRepositoryImpl';
import { BannerRepositoryImpl } from '@/data/repositories/BannerRepositoryImpl';
import { OrderRepositoryImpl } from '@/data/repositories/OrderRepositoryImpl';
import { FavoriteRepositoryImpl } from '@/data/repositories/FavoriteRepositoryImpl';
import { LivestreamRepositoryImpl } from '@/data/repositories/LivestreamRepositoryImpl';
import { CommunityRepositoryImpl } from '@/data/repositories/CommunityRepositoryImpl';
import { SupportRepositoryImpl } from '@/data/repositories/SupportRepositoryImpl';

// Use Cases
import { GetProductsUseCase } from '@/domain/usecases/GetProductsUseCase';
import { GetHomeDataUseCase } from '@/domain/usecases/GetHomeDataUseCase';
import { GetOrdersUseCase } from '@/domain/usecases/GetOrdersUseCase';
import { GetFavoritesUseCase } from '@/domain/usecases/GetFavoritesUseCase';
import { GetLivestreamsUseCase } from '@/domain/usecases/GetLivestreamsUseCase';
import { GetCommunityPostsUseCase } from '@/domain/usecases/GetCommunityPostsUseCase';
import { GetSupportDataUseCase } from '@/domain/usecases/GetSupportTicketsUseCase';

/**
 * Dependency Injection Container
 * Singleton pattern for managing dependencies
 */
class DIContainer {
  private static instance: DIContainer;

  // Data Sources (lazy initialization)
  private _productApiDataSource?: ProductApiDataSource;
  private _bannerApiDataSource?: BannerApiDataSource;
  private _orderApiDataSource?: OrderApiDataSource;
  private _favoriteApiDataSource?: FavoriteApiDataSource;
  private _livestreamApiDataSource?: LivestreamApiDataSource;
  private _communityApiDataSource?: CommunityApiDataSource;
  private _supportApiDataSource?: SupportApiDataSource;

  // Repositories (lazy initialization)
  private _productRepository?: ProductRepositoryImpl;
  private _bannerRepository?: BannerRepositoryImpl;
  private _orderRepository?: OrderRepositoryImpl;
  private _favoriteRepository?: FavoriteRepositoryImpl;
  private _livestreamRepository?: LivestreamRepositoryImpl;
  private _communityRepository?: CommunityRepositoryImpl;
  private _supportRepository?: SupportRepositoryImpl;

  // Use Cases (lazy initialization)
  private _getProductsUseCase?: GetProductsUseCase;
  private _getHomeDataUseCase?: GetHomeDataUseCase;
  private _getOrdersUseCase?: GetOrdersUseCase;
  private _getFavoritesUseCase?: GetFavoritesUseCase;
  private _getLivestreamsUseCase?: GetLivestreamsUseCase;
  private _getCommunityPostsUseCase?: GetCommunityPostsUseCase;
  private _getSupportDataUseCase?: GetSupportDataUseCase;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Data Sources
  get productApiDataSource(): ProductApiDataSource {
    if (!this._productApiDataSource) {
      this._productApiDataSource = new ProductApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._productApiDataSource;
  }

  get bannerApiDataSource(): BannerApiDataSource {
    if (!this._bannerApiDataSource) {
      this._bannerApiDataSource = new BannerApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._bannerApiDataSource;
  }

  get orderApiDataSource(): OrderApiDataSource {
    if (!this._orderApiDataSource) {
      this._orderApiDataSource = new OrderApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._orderApiDataSource;
  }

  get favoriteApiDataSource(): FavoriteApiDataSource {
    if (!this._favoriteApiDataSource) {
      this._favoriteApiDataSource = new FavoriteApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._favoriteApiDataSource;
  }

  get livestreamApiDataSource(): LivestreamApiDataSource {
    if (!this._livestreamApiDataSource) {
      this._livestreamApiDataSource = new LivestreamApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._livestreamApiDataSource;
  }

  get communityApiDataSource(): CommunityApiDataSource {
    if (!this._communityApiDataSource) {
      this._communityApiDataSource = new CommunityApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._communityApiDataSource;
  }

  get supportApiDataSource(): SupportApiDataSource {
    if (!this._supportApiDataSource) {
      this._supportApiDataSource = new SupportApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._supportApiDataSource;
  }

  // Repositories
  get productRepository(): ProductRepositoryImpl {
    if (!this._productRepository) {
      this._productRepository = new ProductRepositoryImpl(this.productApiDataSource);
    }
    return this._productRepository;
  }

  get bannerRepository(): BannerRepositoryImpl {
    if (!this._bannerRepository) {
      this._bannerRepository = new BannerRepositoryImpl(this.bannerApiDataSource);
    }
    return this._bannerRepository;
  }

  get orderRepository(): OrderRepositoryImpl {
    if (!this._orderRepository) {
      this._orderRepository = new OrderRepositoryImpl(this.orderApiDataSource);
    }
    return this._orderRepository;
  }

  get favoriteRepository(): FavoriteRepositoryImpl {
    if (!this._favoriteRepository) {
      this._favoriteRepository = new FavoriteRepositoryImpl(this.favoriteApiDataSource);
    }
    return this._favoriteRepository;
  }

  get livestreamRepository(): LivestreamRepositoryImpl {
    if (!this._livestreamRepository) {
      this._livestreamRepository = new LivestreamRepositoryImpl(this.livestreamApiDataSource);
    }
    return this._livestreamRepository;
  }

  get communityRepository(): CommunityRepositoryImpl {
    if (!this._communityRepository) {
      this._communityRepository = new CommunityRepositoryImpl(this.communityApiDataSource);
    }
    return this._communityRepository;
  }

  get supportRepository(): SupportRepositoryImpl {
    if (!this._supportRepository) {
      this._supportRepository = new SupportRepositoryImpl(this.supportApiDataSource);
    }
    return this._supportRepository;
  }

  // Use Cases
  get getProductsUseCase(): GetProductsUseCase {
    if (!this._getProductsUseCase) {
      this._getProductsUseCase = new GetProductsUseCase(this.productRepository);
    }
    return this._getProductsUseCase;
  }

  get getHomeDataUseCase(): GetHomeDataUseCase {
    if (!this._getHomeDataUseCase) {
      this._getHomeDataUseCase = new GetHomeDataUseCase(
        this.productRepository,
        this.bannerRepository
      );
    }
    return this._getHomeDataUseCase;
  }

  get getOrdersUseCase(): GetOrdersUseCase {
    if (!this._getOrdersUseCase) {
      this._getOrdersUseCase = new GetOrdersUseCase(this.orderRepository);
    }
    return this._getOrdersUseCase;
  }

  get getFavoritesUseCase(): GetFavoritesUseCase {
    if (!this._getFavoritesUseCase) {
      this._getFavoritesUseCase = new GetFavoritesUseCase(this.favoriteRepository);
    }
    return this._getFavoritesUseCase;
  }

  get getLivestreamsUseCase(): GetLivestreamsUseCase {
    if (!this._getLivestreamsUseCase) {
      this._getLivestreamsUseCase = new GetLivestreamsUseCase(this.livestreamRepository);
    }
    return this._getLivestreamsUseCase;
  }

  get getCommunityPostsUseCase(): GetCommunityPostsUseCase {
    if (!this._getCommunityPostsUseCase) {
      this._getCommunityPostsUseCase = new GetCommunityPostsUseCase(this.communityRepository);
    }
    return this._getCommunityPostsUseCase;
  }

  get getSupportDataUseCase(): GetSupportDataUseCase {
    if (!this._getSupportDataUseCase) {
      this._getSupportDataUseCase = new GetSupportDataUseCase(this.supportRepository);
    }
    return this._getSupportDataUseCase;
  }
}

// Export singleton instance
export const container = DIContainer.getInstance();
