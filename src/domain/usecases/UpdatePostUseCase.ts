import { IPostRepository } from '../repositories/IPostRepository';
import { Post, UpdatePostData } from '../entities/Post';

export class UpdatePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(data: UpdatePostData): Promise<Post> {
    const sanitizedContent = data.content?.trim();

    if (sanitizedContent !== undefined) {
      if (sanitizedContent.length === 0) {
        throw new Error('Nội dung bài viết không được để trống');
      }

      if (sanitizedContent.length > 10000) {
        throw new Error('Nội dung bài viết không được vượt quá 10,000 ký tự');
      }
    }

    const existingCount = data.existingImageUrls?.length ?? 0;
    const newCount = data.newImages?.length ?? 0;
    if (existingCount + newCount > 10) {
      throw new Error('Số lượng hình ảnh không được vượt quá 10');
    }

    const payload: UpdatePostData = {
      ...data,
      content: sanitizedContent,
    };

    return await this.postRepository.updatePost(payload);
  }
}
