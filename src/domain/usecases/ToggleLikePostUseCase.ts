import { IPostRepository } from '../repositories/IPostRepository';

export class ToggleLikePostUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    if (!postId || postId.trim().length === 0) {
      throw new Error('Post ID không hợp lệ');
    }

    return await this.postRepository.toggleLike(postId);
  }
}
