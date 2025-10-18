/**
 * Domain Repository Interface
 * Defines contract for community data access
 */
import { CommunityPost, Comment } from '../entities/Community';

export interface ICommunityRepository {
  getPosts(page?: number, limit?: number): Promise<PostsResponse>;
  getPostById(id: string): Promise<CommunityPost>;
  createPost(post: CreatePostDto): Promise<CommunityPost>;
  likePost(postId: string): Promise<void>;
  unlikePost(postId: string): Promise<void>;
  getComments(postId: string): Promise<Comment[]>;
  addComment(postId: string, content: string): Promise<Comment>;
}

export interface PostsResponse {
  posts: CommunityPost[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreatePostDto {
  userId: string;
  content: string;
  images?: string[];
}
