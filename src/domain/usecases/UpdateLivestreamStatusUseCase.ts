import { ILivestreamRepository } from '../repositories/ILivestreamRepository';
import { Livestream, LivestreamStatus } from '../entities/Livestream';

export class UpdateLivestreamStatusUseCase {
  constructor(private livestreamRepository: ILivestreamRepository) {}

  async execute(id: string, status: LivestreamStatus): Promise<Livestream> {
    return await this.livestreamRepository.updateLivestreamStatus(id, status);
  }
}
