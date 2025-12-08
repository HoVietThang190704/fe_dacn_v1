import { ILivestreamRepository } from '../repositories/ILivestreamRepository';
import { Livestream } from '../entities/Livestream';

export class UpdateLivestreamProductsUseCase {
  constructor(private readonly livestreamRepository: ILivestreamRepository) {}

  async execute(id: string, pricing: Livestream['productPricing']): Promise<Livestream> {
    return this.livestreamRepository.updateLivestreamProducts(id, pricing);
  }
}
