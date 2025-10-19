import { ILivestreamRepository } from '../repositories/ILivestreamRepository';
import { Livestream } from '../entities/Livestream';

export class GetLivestreamsUseCase {
  constructor(private livestreamRepository: ILivestreamRepository) {}

  async execute(): Promise<{
    active: Livestream[];
    scheduled: Livestream[];
  }> {
    const [active, scheduled] = await Promise.all([
      this.livestreamRepository.getActiveLivestreams(),
      this.livestreamRepository.getScheduledLivestreams()
    ]);

    return { active, scheduled };
  }
}
