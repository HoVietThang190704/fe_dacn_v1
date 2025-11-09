import { Cart } from '@/domain/entities/Cart';

export interface AddCartItemPayload {
  productId: string;
  shopId?: string;
  quantity: number;
  unit?: string;
  price?: number;
  title?: string;
  thumbnail?: string;
  attrs?: Record<string, unknown>;
}

export interface UpdateCartItemPayload {
  quantity?: number;
  unit?: string;
  price?: number;
  attrs?: Record<string, unknown>;
}

export interface ICartRepository {
  getCart(): Promise<Cart>;
  addItem(payload: AddCartItemPayload): Promise<Cart>;
  updateItem(itemId: string, payload: UpdateCartItemPayload): Promise<Cart>;
  removeItem(itemId: string): Promise<Cart>;
  clearCart(): Promise<void>;
}
