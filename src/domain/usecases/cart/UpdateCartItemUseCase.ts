import { Cart } from '@/domain/entities/Cart';
import { ICartRepository, UpdateCartItemPayload } from '@/domain/repositories/ICartRepository';

export class UpdateCartItemUseCase {
  constructor(private readonly cartRepository: ICartRepository) {}

  async execute(itemId: string, payload: UpdateCartItemPayload): Promise<Cart> {
    return await this.cartRepository.updateItem(itemId, payload);
  }
}
