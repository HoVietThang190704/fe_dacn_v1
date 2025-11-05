import { ILivestreamRepository } from '../repositories/ILivestreamRepository';
import { AgoraToken } from '../entities/Livestream';

export class GetAgoraTokenUseCase {
  constructor(private livestreamRepository: ILivestreamRepository) {}

  async execute(channel: string, uid: number, role: 'publisher' | 'audience'): Promise<AgoraToken> {
    return await this.livestreamRepository.getAgoraToken(channel, uid, role);
  }
}
