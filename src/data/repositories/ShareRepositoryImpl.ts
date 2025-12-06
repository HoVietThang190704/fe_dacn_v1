import { ShareInfo } from '@/domain/entities/ShareInfo';
import { IShareRepository } from '@/domain/repositories/IShareRepository';
import { ShareApiDataSource } from '@/data/datasources/ShareApiDataSource';

export class ShareRepositoryImpl implements IShareRepository {
  constructor(private readonly apiDataSource: ShareApiDataSource) {}

  async getPostShareInfo(postId: string, locale?: string): Promise<ShareInfo> {
    return this.apiDataSource.getPostShareInfo(postId, locale);
  }

  async getProductShareInfo(productId: string, locale?: string): Promise<ShareInfo> {
    return this.apiDataSource.getProductShareInfo(productId, locale);
  }
}
