import { IPostRepository } from '../repositories/IPostRepository';
import { Post, CreatePostData } from '../entities/Post';

export class CreatePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(data: CreatePostData): Promise<Post> {
    // Validation - allow posts with only content OR only images OR both
    const hasContent = data.content && data.content.trim().length > 0;
    const hasImages = data.images && data.images.length > 0;
    
    if (!hasContent && !hasImages) {
      throw new Error('Bài viết phải có nội dung hoặc hình ảnh');
    }

    if (data.content && data.content.length > 10000) {
      throw new Error('Nội dung bài viết không được vượt quá 10,000 ký tự');
    }

    if (data.images && data.images.length > 10) {
      throw new Error('Số lượng hình ảnh không được vượt quá 10');
    }

    return await this.postRepository.createPost(data);
  }
}
