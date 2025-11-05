import { ILivestreamRepository } from '../repositories/ILivestreamRepository';
import { Livestream, CreateLivestreamDto } from '../entities/Livestream';

export class CreateLivestreamUseCase {
  constructor(private livestreamRepository: ILivestreamRepository) {}

  async execute(data: CreateLivestreamDto): Promise<Livestream> {
    return await this.livestreamRepository.createLivestream(data);
  }
}
