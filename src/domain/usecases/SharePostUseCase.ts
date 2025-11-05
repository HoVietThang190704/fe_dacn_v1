import { IPostRepository } from '../repositories/IPostRepository';
import { Post, SharePostData } from '../entities/Post';

export class SharePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(data: SharePostData): Promise<Post> {
    if (!data.originalPostId || data.originalPostId.trim().length === 0) {
      throw new Error('Original Post ID không hợp lệ');
    }

    if (data.content && data.content.length > 1000) {
      throw new Error('Nội dung chia sẻ không được vượt quá 1,000 ký tự');
    }

    return await this.postRepository.sharePost(data);
  }
}
