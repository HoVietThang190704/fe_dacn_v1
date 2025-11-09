import { IFavoriteRepository } from '../repositories/IFavoriteRepository';
import { Favorite } from '../entities/Favorite';

export class RemoveFavoriteUseCase {
  constructor(private readonly favoriteRepository: IFavoriteRepository) {}

  async execute(productId: string): Promise<Favorite[]> {
    if (!productId || productId.trim().length === 0) {
      throw new Error('Product ID không hợp lệ');
    }

    return await this.favoriteRepository.removeFavorite(productId);
  }
}
