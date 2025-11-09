import { Cart, CartItem } from '@/domain/entities/Cart';
import { AddCartItemPayload, UpdateCartItemPayload } from '@/domain/repositories/ICartRepository';
import { API_CONFIG, API_ENDPOINTS } from '@/shared/constants/api';
import { authApiClient } from '@/lib/authApiClient';

type CartItemDto = {
  id: string;
  productId: string;
  shopId?: string;
  quantity: number;
  unit?: string;
  price?: number;
  title?: string;
  thumbnail?: string;
  attrs?: Record<string, unknown>;
  addedAt?: string;
};

type CartDto = {
  id: string;
  userId: string;
  items?: CartItemDto[];
  createdAt: string;
  updatedAt: string;
};

type CartResponse = {
  success?: boolean;
  data?: CartDto;
  message?: string;
};

export class CartApiDataSource {
  constructor(private readonly baseUrl: string = API_CONFIG.BASE_URL) {
    if (!this.baseUrl) {
      throw new Error('CartApiDataSource requires a valid baseUrl');
    }
  }

  async getCart(): Promise<Cart> {
    const response = await authApiClient.get<CartResponse>(API_ENDPOINTS.CART);
    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể lấy thông tin giỏ hàng');
    }
    return this.mapCart(response.data.data);
  }

  async addItem(payload: AddCartItemPayload): Promise<Cart> {
    const response = await authApiClient.post<CartResponse>(
      API_ENDPOINTS.CART_ITEMS,
      {
        productId: payload.productId,
        shopId: payload.shopId,
        quantity: payload.quantity,
        unit: payload.unit,
        price: payload.price,
        title: payload.title,
        thumbnail: payload.thumbnail,
        attrs: payload.attrs,
      }
    );

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
    return this.mapCart(response.data.data);
  }

  async updateItem(itemId: string, payload: UpdateCartItemPayload): Promise<Cart> {
    const response = await authApiClient.put<CartResponse>(
      API_ENDPOINTS.CART_ITEM(itemId),
      {
        quantity: payload.quantity,
        unit: payload.unit,
        price: payload.price,
        attrs: payload.attrs,
      }
    );

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể cập nhật sản phẩm trong giỏ hàng');
    }
    return this.mapCart(response.data.data);
  }

  async removeItem(itemId: string): Promise<Cart> {
    const response = await authApiClient.delete<CartResponse>(
      API_ENDPOINTS.CART_ITEM(itemId)
    );

    if (!response.success || !response.data?.data) {
      throw new Error(response.error || 'Không thể xóa sản phẩm khỏi giỏ hàng');
    }
    return this.mapCart(response.data.data);
  }

  async clearCart(): Promise<void> {
    const response = await authApiClient.delete<CartResponse>(API_ENDPOINTS.CART);
    if (!response.success) {
      throw new Error(response.error || 'Không thể xóa giỏ hàng');
    }
  }

  private mapCartItem(dto: CartItemDto): CartItem {
    return {
      id: dto.id,
      productId: dto.productId,
      shopId: dto.shopId,
      quantity: dto.quantity,
      unit: dto.unit,
      price: dto.price,
      title: dto.title,
      thumbnail: dto.thumbnail,
      attrs: dto.attrs,
      addedAt: dto.addedAt,
    };
  }

  private mapCart(dto: CartDto): Cart {
    return {
      id: dto.id,
      userId: dto.userId,
      items: Array.isArray(dto.items) ? dto.items.map((item) => this.mapCartItem(item)) : [],
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
}
