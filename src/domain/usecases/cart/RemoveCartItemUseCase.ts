import { Cart } from '@/domain/entities/Cart';
import { ICartRepository } from '@/domain/repositories/ICartRepository';

export class RemoveCartItemUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(itemId: string): Promise<Cart> {
    return await this.cartRepository.removeItem(itemId);
  }
}
