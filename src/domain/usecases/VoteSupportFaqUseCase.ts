import { ISupportRepository } from '../repositories/ISupportRepository';

export class VoteSupportFaqUseCase {
  constructor(private readonly supportRepository: ISupportRepository) {}

  async execute(faqId: string, vote: 'helpful' | 'not_helpful') {
    return this.supportRepository.voteOnFAQ(faqId, vote);
  }
}
