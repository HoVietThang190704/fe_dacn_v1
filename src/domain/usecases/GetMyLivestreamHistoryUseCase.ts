import { ILivestreamRepository } from '../repositories/ILivestreamRepository';
import { Livestream } from '../entities/Livestream';

export class GetMyLivestreamHistoryUseCase {
  constructor(private livestreamRepository: ILivestreamRepository) {}

  async execute(userId: string): Promise<Livestream[]> {
    return await this.livestreamRepository.getUserHistory(userId);
  }
}
