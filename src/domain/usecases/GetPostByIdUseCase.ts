import { IPostRepository } from '../repositories/IPostRepository';
import { Post } from '../entities/Post';

export class GetPostByIdUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(postId: string): Promise<Post> {
    if (!postId || postId.trim().length === 0) {
      throw new Error('Post ID không hợp lệ');
    }

    return await this.postRepository.getPostById(postId);
  }
}
