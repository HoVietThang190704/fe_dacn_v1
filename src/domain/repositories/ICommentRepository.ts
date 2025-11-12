import { Comment, CreateCommentData, UpdateCommentData, PaginatedComments } from '../entities/Comment';

export interface ICommentRepository {
  getCommentsByPostId(postId: string, page: number, limit: number): Promise<PaginatedComments>;
  getCommentsWithNested(postId: string, page: number, limit: number): Promise<PaginatedComments>;
  getReplies(parentCommentId: string, page: number, limit: number): Promise<PaginatedComments>;
  getCommentById(commentId: string): Promise<Comment>;
  createComment(data: CreateCommentData): Promise<Comment>;
  updateComment(data: UpdateCommentData): Promise<Comment>;
  deleteComment(commentId: string): Promise<void>;
  toggleLike(commentId: string): Promise<{ liked: boolean; likesCount: number }>;
  uploadImages(files: File[]): Promise<{ urls: string[]; publicIds: string[] }>;
}
