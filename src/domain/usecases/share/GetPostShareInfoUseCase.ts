import { ShareInfo } from '@/domain/entities/ShareInfo';
import { IShareRepository } from '@/domain/repositories/IShareRepository';

interface GetPostShareInfoParams {
  postId: string;
  locale?: string;
}

export class GetPostShareInfoUseCase {
  constructor(private readonly shareRepository: IShareRepository) {}

  async execute(params: GetPostShareInfoParams): Promise<ShareInfo> {
    if (!params?.postId) {
      throw new Error('Post ID is required');
    }
    return this.shareRepository.getPostShareInfo(params.postId, params.locale);
  }
}
