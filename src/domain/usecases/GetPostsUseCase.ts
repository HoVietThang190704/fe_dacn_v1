import { IPostRepository } from '../repositories/IPostRepository';
import { PaginatedPosts } from '../entities/Post';

export class GetPostsFeedUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    return await this.postRepository.getFeed(page, limit);
  }
}

export class GetPublicPostsUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    return await this.postRepository.getPublicPosts(page, limit);
  }
}

export class GetUserPostsUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID không hợp lệ');
    }

    return await this.postRepository.getPostsByUserId(userId, page, limit);
  }
}

export class SearchPostsUseCase {
  constructor(private postRepository: IPostRepository) {}

  async execute(query: string, page: number = 1, limit: number = 20): Promise<PaginatedPosts> {
    if (!query || query.trim().length < 1) {
      throw new Error('Từ khóa tìm kiếm phải có ít nhất 1 ký tự');
    }

    return await this.postRepository.searchPosts(query, page, limit);
  }
}
