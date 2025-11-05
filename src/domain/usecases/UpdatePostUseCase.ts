import { IPostRepository } from '../repositories/IPostRepository';
import { Post, UpdatePostData } from '../entities/Post';

export class UpdatePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(data: UpdatePostData): Promise<Post> {
    // Validation
    if (data.content !== undefined) {
      if (data.content.trim().length === 0) {
        throw new Error('Nội dung bài viết không được để trống');
      }

      if (data.content.length > 10000) {
        throw new Error('Nội dung bài viết không được vượt quá 10,000 ký tự');
      }
    }

    if (data.images && data.images.length > 10) {
      throw new Error('Số lượng hình ảnh không được vượt quá 10');
    }

    return await this.postRepository.updatePost(data);
  }
}
