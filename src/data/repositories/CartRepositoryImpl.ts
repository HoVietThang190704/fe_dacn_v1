import { Cart } from '@/domain/entities/Cart';
import {
  AddCartItemPayload,
  ICartRepository,
  UpdateCartItemPayload,
} from '@/domain/repositories/ICartRepository';
import { CartApiDataSource } from '@/data/datasources/CartApiDataSource';

export class CartRepositoryImpl implements ICartRepository {
  constructor(private readonly dataSource: CartApiDataSource) {}

  async getCart(): Promise<Cart> {
    return await this.dataSource.getCart();
  }

  async addItem(payload: AddCartItemPayload): Promise<Cart> {
    return await this.dataSource.addItem(payload);
  }

  async updateItem(itemId: string, payload: UpdateCartItemPayload): Promise<Cart> {
    return await this.dataSource.updateItem(itemId, payload);
  }

  async removeItem(itemId: string): Promise<Cart> {
    return await this.dataSource.removeItem(itemId);
  }

  async clearCart(): Promise<void> {
    await this.dataSource.clearCart();
  }
}
