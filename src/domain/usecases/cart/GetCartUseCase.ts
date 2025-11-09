import { Cart } from '@/domain/entities/Cart';
import { ICartRepository } from '@/domain/repositories/ICartRepository';

export class GetCartUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(): Promise<Cart> {
    return await this.cartRepository.getCart();
  }
}
