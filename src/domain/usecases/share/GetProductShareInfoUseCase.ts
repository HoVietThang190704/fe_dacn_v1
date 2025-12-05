import { ShareInfo } from '@/domain/entities/ShareInfo';
import { IShareRepository } from '@/domain/repositories/IShareRepository';

interface GetProductShareInfoParams {
  productId: string;
  locale?: string;
}

export class GetProductShareInfoUseCase {
  constructor(private readonly shareRepository: IShareRepository) {}

  async execute(params: GetProductShareInfoParams): Promise<ShareInfo> {
    if (!params?.productId) {
      throw new Error('Product ID is required');
    }
    return this.shareRepository.getProductShareInfo(params.productId, params.locale);
  }
}
