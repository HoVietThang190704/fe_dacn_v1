import { API_CONFIG } from '@/shared/constants/api';

import { ProductApiDataSource } from '@/data/datasources/ProductApiDataSource';
import { BannerApiDataSource } from '@/data/datasources/BannerApiDataSource';
import { OrderApiDataSource } from '@/data/datasources/OrderApiDataSource';
import { FavoriteApiDataSource } from '@/data/datasources/FavoriteApiDataSource';
import { LivestreamApiDataSource } from '@/data/datasources/LivestreamApiDataSource';
import { CommunityApiDataSource } from '@/data/datasources/CommunityApiDataSource';
import { UserApiDataSource } from '@/data/datasources/UserApiDataSource';
import { SupportApiDataSource } from '@/data/datasources/SupportApiDataSource';
import { ProductReviewApiDataSource } from '@/data/datasources/ProductReviewApiDataSource';
import { CartApiDataSource } from '@/data/datasources/CartApiDataSource';

import { ProductRepositoryImpl } from '@/data/repositories/ProductRepositoryImpl';
import { BannerRepositoryImpl } from '@/data/repositories/BannerRepositoryImpl';
import { OrderRepositoryImpl } from '@/data/repositories/OrderRepositoryImpl';
import { FavoriteRepositoryImpl } from '@/data/repositories/FavoriteRepositoryImpl';
import { LivestreamRepositoryImpl } from '@/data/repositories/LivestreamRepositoryImpl';
import { CommunityRepositoryImpl } from '@/data/repositories/CommunityRepositoryImpl';
import { UserRepositoryImpl } from '@/data/repositories/UserRepositoryImpl';
import { SupportRepositoryImpl } from '@/data/repositories/SupportRepositoryImpl';
import { ProductReviewRepositoryImpl } from '@/data/repositories/ProductReviewRepositoryImpl';
import { CartRepositoryImpl } from '@/data/repositories/CartRepositoryImpl';

import { GetProductsUseCase } from '@/domain/usecases/GetProductsUseCase';
import { GetHomeDataUseCase } from '@/domain/usecases/GetHomeDataUseCase';
import { GetOrdersUseCase } from '@/domain/usecases/GetOrdersUseCase';
import { CreateOrderUseCase } from '@/domain/usecases/order/CreateOrderUseCase';
import { CancelOrderUseCase } from '@/domain/usecases/order/CancelOrderUseCase';
import { GetOrderStatisticsUseCase } from '@/domain/usecases/order/GetOrderStatisticsUseCase';
import { ApplyVoucherUseCase } from '@/domain/usecases/order/ApplyVoucherUseCase';
import { PayOrderUseCase } from '@/domain/usecases/order/PayOrderUseCase';
import { GetFavoritesUseCase } from '@/domain/usecases/GetFavoritesUseCase';
import { AddFavoriteUseCase } from '@/domain/usecases/AddFavoriteUseCase';
import { RemoveFavoriteUseCase } from '@/domain/usecases/RemoveFavoriteUseCase';
import { ToggleFavoriteUseCase } from '@/domain/usecases/ToggleFavoriteUseCase';
import { GetLivestreamsUseCase } from '@/domain/usecases/GetLivestreamsUseCase';
import { GetCommunityPostsUseCase } from '@/domain/usecases/GetCommunityPostsUseCase';
import { CreateCommunityPostUseCase } from '@/domain/usecases/CreateCommunityPostUseCase';
import { GetProductByIdUseCase } from '@/domain/usecases/GetProductByIdUseCase';
import { UpdateUserProfileUseCase } from '@/domain/usecases/UpdateUserProfileUseCase';
import { GetUserProfileUseCase } from '@/domain/usecases/GetUserProfileUseCase';
import { UploadUserAvatarUseCase } from '@/domain/usecases/UploadUserAvatarUseCase';
import { ChangePasswordUseCase } from '@/domain/usecases/user/ChangePasswordUseCase';
import { GetOrderByIdUseCase } from '@/domain/usecases/GetOrderByIdUseCase';
import { GetSupportDataUseCase } from '@/domain/usecases/GetSupportTicketsUseCase';
import { CreateLivestreamUseCase } from '@/domain/usecases/CreateLivestreamUseCase';
import { GetLivestreamByIdUseCase } from '@/domain/usecases/GetLivestreamByIdUseCase';
import { UpdateLivestreamStatusUseCase } from '@/domain/usecases/UpdateLivestreamStatusUseCase';
import { GetAgoraTokenUseCase } from '@/domain/usecases/GetAgoraTokenUseCase';
import { GetMyLivestreamHistoryUseCase } from '@/domain/usecases/GetMyLivestreamHistoryUseCase';
import { CreateProductUseCase } from '@/domain/usecases/CreateProductUseCase';
import { UpdateProductUseCase } from '@/domain/usecases/UpdateProductUseCase';
import { DeleteProductUseCase } from '@/domain/usecases/DeleteProductUseCase';
import { GetProductReviewsUseCase } from '@/domain/usecases/GetProductReviewsUseCase';
import { CreateProductReviewUseCase } from '@/domain/usecases/CreateProductReviewUseCase';
import { UpdateProductReviewUseCase } from '@/domain/usecases/UpdateProductReviewUseCase';
import { DeleteProductReviewUseCase } from '@/domain/usecases/DeleteProductReviewUseCase';
import { GetCartUseCase } from '@/domain/usecases/cart/GetCartUseCase';
import { AddCartItemUseCase } from '@/domain/usecases/cart/AddCartItemUseCase';
import { UpdateCartItemUseCase } from '@/domain/usecases/cart/UpdateCartItemUseCase';
import { RemoveCartItemUseCase } from '@/domain/usecases/cart/RemoveCartItemUseCase';
import { ClearCartUseCase } from '@/domain/usecases/cart/ClearCartUseCase';

class DIContainer {
  private static instance: DIContainer;

  private _productApiDataSource?: ProductApiDataSource;
  private _bannerApiDataSource?: BannerApiDataSource;
  private _orderApiDataSource?: OrderApiDataSource;
  private _favoriteApiDataSource?: FavoriteApiDataSource;
  private _livestreamApiDataSource?: LivestreamApiDataSource;
  private _communityApiDataSource?: CommunityApiDataSource;
  private _userApiDataSource?: UserApiDataSource;
  private _supportApiDataSource?: SupportApiDataSource;
  private _productReviewApiDataSource?: ProductReviewApiDataSource;
  private _cartApiDataSource?: CartApiDataSource;

  private _productRepository?: ProductRepositoryImpl;
  private _bannerRepository?: BannerRepositoryImpl;
  private _orderRepository?: OrderRepositoryImpl;
  private _favoriteRepository?: FavoriteRepositoryImpl;
  private _livestreamRepository?: LivestreamRepositoryImpl;
  private _communityRepository?: CommunityRepositoryImpl;
  private _userRepository?: UserRepositoryImpl;
  private _supportRepository?: SupportRepositoryImpl;
  private _productReviewRepository?: ProductReviewRepositoryImpl;
  private _cartRepository?: CartRepositoryImpl;

  private _getProductsUseCase?: GetProductsUseCase;
  private _getHomeDataUseCase?: GetHomeDataUseCase;
  private _getOrdersUseCase?: GetOrdersUseCase;
  private _createOrderUseCase?: CreateOrderUseCase;
  private _cancelOrderUseCase?: CancelOrderUseCase;
  private _getOrderStatisticsUseCase?: GetOrderStatisticsUseCase;
  private _applyVoucherUseCase?: ApplyVoucherUseCase;
  private _payOrderUseCase?: PayOrderUseCase;
  private _getFavoritesUseCase?: GetFavoritesUseCase;
  private _addFavoriteUseCase?: AddFavoriteUseCase;
  private _removeFavoriteUseCase?: RemoveFavoriteUseCase;
  private _toggleFavoriteUseCase?: ToggleFavoriteUseCase;
  private _getLivestreamsUseCase?: GetLivestreamsUseCase;
  private _getCommunityPostsUseCase?: GetCommunityPostsUseCase;
  private _createCommunityPostUseCase?: CreateCommunityPostUseCase;
  private _getProductByIdUseCase?: GetProductByIdUseCase;
  private _createProductUseCase?: CreateProductUseCase;
  private _updateProductUseCase?: UpdateProductUseCase;
  private _deleteProductUseCase?: DeleteProductUseCase;
  private _getUserProfileUseCase?: GetUserProfileUseCase;
  private _updateUserProfileUseCase?: UpdateUserProfileUseCase;
  private _uploadUserAvatarUseCase?: UploadUserAvatarUseCase;
  private _changePasswordUseCase?: ChangePasswordUseCase;
  private _getOrderByIdUseCase?: GetOrderByIdUseCase;
  private _getSupportDataUseCase?: GetSupportDataUseCase;
  private _createLivestreamUseCase?: CreateLivestreamUseCase;
  private _getLivestreamByIdUseCase?: GetLivestreamByIdUseCase;
  private _updateLivestreamStatusUseCase?: UpdateLivestreamStatusUseCase;
  private _getAgoraTokenUseCase?: GetAgoraTokenUseCase;
  private _getMyLivestreamHistoryUseCase?: GetMyLivestreamHistoryUseCase;
  private _getProductReviewsUseCase?: GetProductReviewsUseCase;
  private _createProductReviewUseCase?: CreateProductReviewUseCase;
  private _updateProductReviewUseCase?: UpdateProductReviewUseCase;
  private _deleteProductReviewUseCase?: DeleteProductReviewUseCase;
  private _getCartUseCase?: GetCartUseCase;
  private _addCartItemUseCase?: AddCartItemUseCase;
  private _updateCartItemUseCase?: UpdateCartItemUseCase;
  private _removeCartItemUseCase?: RemoveCartItemUseCase;
  private _clearCartUseCase?: ClearCartUseCase;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

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
      this._orderApiDataSource = new OrderApiDataSource();
    }
    return this._orderApiDataSource;
  }

  get favoriteApiDataSource(): FavoriteApiDataSource {
    if (!this._favoriteApiDataSource) {
      this._favoriteApiDataSource = new FavoriteApiDataSource();
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

  get userApiDataSource(): UserApiDataSource {
    if (!this._userApiDataSource) {
      this._userApiDataSource = new UserApiDataSource();
    }
    return this._userApiDataSource;
  }

  get supportApiDataSource(): SupportApiDataSource {
    if (!this._supportApiDataSource) {
      this._supportApiDataSource = new SupportApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._supportApiDataSource;
  }

  get productReviewApiDataSource(): ProductReviewApiDataSource {
    if (!this._productReviewApiDataSource) {
      this._productReviewApiDataSource = new ProductReviewApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._productReviewApiDataSource;
  }

  get cartApiDataSource(): CartApiDataSource {
    if (!this._cartApiDataSource) {
      this._cartApiDataSource = new CartApiDataSource(API_CONFIG.BASE_URL);
    }
    return this._cartApiDataSource;
  }

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

  get userRepository(): UserRepositoryImpl {
    if (!this._userRepository) {
      this._userRepository = new UserRepositoryImpl(this.userApiDataSource);
    }
    return this._userRepository;
  }

  get supportRepository(): SupportRepositoryImpl {
    if (!this._supportRepository) {
      this._supportRepository = new SupportRepositoryImpl(this.supportApiDataSource);
    }
    return this._supportRepository;
  }

  get productReviewRepository(): ProductReviewRepositoryImpl {
    if (!this._productReviewRepository) {
      this._productReviewRepository = new ProductReviewRepositoryImpl(this.productReviewApiDataSource);
    }
    return this._productReviewRepository;
  }

  get cartRepository(): CartRepositoryImpl {
    if (!this._cartRepository) {
      this._cartRepository = new CartRepositoryImpl(this.cartApiDataSource);
    }
    return this._cartRepository;
  }

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

  get createOrderUseCase(): CreateOrderUseCase {
    if (!this._createOrderUseCase) {
      this._createOrderUseCase = new CreateOrderUseCase(this.orderRepository);
    }
    return this._createOrderUseCase;
  }

  get cancelOrderUseCase(): CancelOrderUseCase {
    if (!this._cancelOrderUseCase) {
      this._cancelOrderUseCase = new CancelOrderUseCase(this.orderRepository);
    }
    return this._cancelOrderUseCase;
  }

  get getOrderStatisticsUseCase(): GetOrderStatisticsUseCase {
    if (!this._getOrderStatisticsUseCase) {
      this._getOrderStatisticsUseCase = new GetOrderStatisticsUseCase(this.orderRepository);
    }
    return this._getOrderStatisticsUseCase;
  }

  get applyVoucherUseCase(): ApplyVoucherUseCase {
    if (!this._applyVoucherUseCase) {
      this._applyVoucherUseCase = new ApplyVoucherUseCase(this.orderRepository);
    }
    return this._applyVoucherUseCase;
  }

  get payOrderUseCase(): PayOrderUseCase {
    if (!this._payOrderUseCase) {
      this._payOrderUseCase = new PayOrderUseCase(this.orderRepository);
    }
    return this._payOrderUseCase;
  }

  get getFavoritesUseCase(): GetFavoritesUseCase {
    if (!this._getFavoritesUseCase) {
      this._getFavoritesUseCase = new GetFavoritesUseCase(this.favoriteRepository);
    }
    return this._getFavoritesUseCase;
  }

  get addFavoriteUseCase(): AddFavoriteUseCase {
    if (!this._addFavoriteUseCase) {
      this._addFavoriteUseCase = new AddFavoriteUseCase(this.favoriteRepository);
    }
    return this._addFavoriteUseCase;
  }

  get removeFavoriteUseCase(): RemoveFavoriteUseCase {
    if (!this._removeFavoriteUseCase) {
      this._removeFavoriteUseCase = new RemoveFavoriteUseCase(this.favoriteRepository);
    }
    return this._removeFavoriteUseCase;
  }

  get toggleFavoriteUseCase(): ToggleFavoriteUseCase {
    if (!this._toggleFavoriteUseCase) {
      this._toggleFavoriteUseCase = new ToggleFavoriteUseCase(this.favoriteRepository);
    }
    return this._toggleFavoriteUseCase;
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

  get createCommunityPostUseCase(): CreateCommunityPostUseCase {
    if (!this._createCommunityPostUseCase) {
      this._createCommunityPostUseCase = new CreateCommunityPostUseCase(this.communityRepository);
    }
    return this._createCommunityPostUseCase;
  }

  get getProductByIdUseCase(): GetProductByIdUseCase {
    if (!this._getProductByIdUseCase) {
      this._getProductByIdUseCase = new GetProductByIdUseCase(this.productRepository);
    }
    return this._getProductByIdUseCase;
  }

  get createProductUseCase(): CreateProductUseCase {
    if (!this._createProductUseCase) {
      this._createProductUseCase = new CreateProductUseCase(this.productRepository);
    }
    return this._createProductUseCase;
  }

  get updateProductUseCase(): UpdateProductUseCase {
    if (!this._updateProductUseCase) {
      this._updateProductUseCase = new UpdateProductUseCase(this.productRepository);
    }
    return this._updateProductUseCase;
  }

  get deleteProductUseCase(): DeleteProductUseCase {
    if (!this._deleteProductUseCase) {
      this._deleteProductUseCase = new DeleteProductUseCase(this.productRepository);
    }
    return this._deleteProductUseCase;
  }

  get getUserProfileUseCase(): GetUserProfileUseCase {
    if (!this._getUserProfileUseCase) {
      this._getUserProfileUseCase = new GetUserProfileUseCase(this.userRepository);
    }
    return this._getUserProfileUseCase;
  }

  get updateUserProfileUseCase(): UpdateUserProfileUseCase {
    if (!this._updateUserProfileUseCase) {
      this._updateUserProfileUseCase = new UpdateUserProfileUseCase(this.userRepository);
    }
    return this._updateUserProfileUseCase;
  }

  get uploadUserAvatarUseCase(): UploadUserAvatarUseCase {
    if (!this._uploadUserAvatarUseCase) {
      this._uploadUserAvatarUseCase = new UploadUserAvatarUseCase(this.userRepository);
    }
    return this._uploadUserAvatarUseCase;
  }

  get changePasswordUseCase(): ChangePasswordUseCase {
    if (!this._changePasswordUseCase) {
      this._changePasswordUseCase = new ChangePasswordUseCase(this.userRepository);
    }
    return this._changePasswordUseCase;
  }

  get getOrderByIdUseCase(): GetOrderByIdUseCase {
    if (!this._getOrderByIdUseCase) {
      this._getOrderByIdUseCase = new GetOrderByIdUseCase(this.orderRepository);
    }
    return this._getOrderByIdUseCase;
  }

  get getSupportDataUseCase(): GetSupportDataUseCase {
    if (!this._getSupportDataUseCase) {
      this._getSupportDataUseCase = new GetSupportDataUseCase(this.supportRepository);
    }
    return this._getSupportDataUseCase;
  }

  get createLivestreamUseCase(): CreateLivestreamUseCase {
    if (!this._createLivestreamUseCase) {
      this._createLivestreamUseCase = new CreateLivestreamUseCase(this.livestreamRepository);
    }
    return this._createLivestreamUseCase;
  }

  get getLivestreamByIdUseCase(): GetLivestreamByIdUseCase {
    if (!this._getLivestreamByIdUseCase) {
      this._getLivestreamByIdUseCase = new GetLivestreamByIdUseCase(this.livestreamRepository);
    }
    return this._getLivestreamByIdUseCase;
  }

  get updateLivestreamStatusUseCase(): UpdateLivestreamStatusUseCase {
    if (!this._updateLivestreamStatusUseCase) {
      this._updateLivestreamStatusUseCase = new UpdateLivestreamStatusUseCase(this.livestreamRepository);
    }
    return this._updateLivestreamStatusUseCase;
  }

  get getAgoraTokenUseCase(): GetAgoraTokenUseCase {
    if (!this._getAgoraTokenUseCase) {
      this._getAgoraTokenUseCase = new GetAgoraTokenUseCase(this.livestreamRepository);
    }
    return this._getAgoraTokenUseCase;
  }

  get getMyLivestreamHistoryUseCase(): GetMyLivestreamHistoryUseCase {
    if (!this._getMyLivestreamHistoryUseCase) {
      this._getMyLivestreamHistoryUseCase = new GetMyLivestreamHistoryUseCase(this.livestreamRepository);
    }
    return this._getMyLivestreamHistoryUseCase;
  }

  get getProductReviewsUseCase(): GetProductReviewsUseCase {
    if (!this._getProductReviewsUseCase) {
      this._getProductReviewsUseCase = new GetProductReviewsUseCase(this.productReviewRepository);
    }
    return this._getProductReviewsUseCase;
  }

  get createProductReviewUseCase(): CreateProductReviewUseCase {
    if (!this._createProductReviewUseCase) {
      this._createProductReviewUseCase = new CreateProductReviewUseCase(this.productReviewRepository);
    }
    return this._createProductReviewUseCase;
  }

  get updateProductReviewUseCase(): UpdateProductReviewUseCase {
    if (!this._updateProductReviewUseCase) {
      this._updateProductReviewUseCase = new UpdateProductReviewUseCase(this.productReviewRepository);
    }
    return this._updateProductReviewUseCase;
  }

  get deleteProductReviewUseCase(): DeleteProductReviewUseCase {
    if (!this._deleteProductReviewUseCase) {
      this._deleteProductReviewUseCase = new DeleteProductReviewUseCase(this.productReviewRepository);
    }
    return this._deleteProductReviewUseCase;
  }

  get getCartUseCase(): GetCartUseCase {
    if (!this._getCartUseCase) {
      this._getCartUseCase = new GetCartUseCase(this.cartRepository);
    }
    return this._getCartUseCase;
  }

  get addCartItemUseCase(): AddCartItemUseCase {
    if (!this._addCartItemUseCase) {
      this._addCartItemUseCase = new AddCartItemUseCase(this.cartRepository);
    }
    return this._addCartItemUseCase;
  }

  get updateCartItemUseCase(): UpdateCartItemUseCase {
    if (!this._updateCartItemUseCase) {
      this._updateCartItemUseCase = new UpdateCartItemUseCase(this.cartRepository);
    }
    return this._updateCartItemUseCase;
  }

  get removeCartItemUseCase(): RemoveCartItemUseCase {
    if (!this._removeCartItemUseCase) {
      this._removeCartItemUseCase = new RemoveCartItemUseCase(this.cartRepository);
    }
    return this._removeCartItemUseCase;
  }

  get clearCartUseCase(): ClearCartUseCase {
    if (!this._clearCartUseCase) {
      this._clearCartUseCase = new ClearCartUseCase(this.cartRepository);
    }
    return this._clearCartUseCase;
  }
}

export const container = DIContainer.getInstance();
