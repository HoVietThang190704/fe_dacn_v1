import { IFavoriteRepository } from '../repositories/IFavoriteRepository';
import { Favorite } from '../entities/Favorite';

export class GetFavoritesUseCase {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute(userId?: string): Promise<Favorite[]> {
    if (typeof userId === 'string' && userId.trim().length === 0) {
      throw new Error('User ID không hợp lệ');
    }

    return await this.favoriteRepository.getFavorites(userId);
  }
}
