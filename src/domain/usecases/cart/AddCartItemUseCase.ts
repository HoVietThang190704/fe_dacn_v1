import { Cart } from '@/domain/entities/Cart';
import { AddCartItemPayload, ICartRepository } from '@/domain/repositories/ICartRepository';

export class AddCartItemUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(payload: AddCartItemPayload): Promise<Cart> {
    return await this.cartRepository.addItem(payload);
  }
}
