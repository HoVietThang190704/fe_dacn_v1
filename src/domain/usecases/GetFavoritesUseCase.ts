import { IFavoriteRepository } from '../repositories/IFavoriteRepository';
import { Favorite } from '../entities/Favorite';

export class GetFavoritesUseCase {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async execute(userId: string): Promise<Favorite[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    return await this.favoriteRepository.getFavorites(userId);
  }
}
