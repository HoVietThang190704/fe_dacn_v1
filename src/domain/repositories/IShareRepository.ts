import { ShareInfo } from '../entities/ShareInfo';

export interface IShareRepository {
  getPostShareInfo(postId: string, locale?: string): Promise<ShareInfo>;
  getProductShareInfo(productId: string, locale?: string): Promise<ShareInfo>;
}
