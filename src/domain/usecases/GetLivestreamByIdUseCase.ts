import { ILivestreamRepository } from '../repositories/ILivestreamRepository';
import { Livestream } from '../entities/Livestream';

export class GetLivestreamByIdUseCase {
  constructor(private livestreamRepository: ILivestreamRepository) {}

  async execute(id: string): Promise<Livestream> {
    return await this.livestreamRepository.getLivestreamById(id);
  }
}
