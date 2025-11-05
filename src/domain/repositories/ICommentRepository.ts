import { Comment, CreateCommentData, UpdateCommentData, PaginatedComments } from '../entities/Comment';

/**
 * Comment Repository Interface
 * Defines contract for comment data operations
 */
export interface ICommentRepository {
  /**
   * Get comments by post ID (top-level only)
   */
  getCommentsByPostId(postId: string, page: number, limit: number): Promise<PaginatedComments>;

  /**
   * Get comments with nested structure
   */
  getCommentsWithNested(postId: string, page: number, limit: number): Promise<PaginatedComments>;

  /**
   * Get replies to a comment
   */
  getReplies(parentCommentId: string, page: number, limit: number): Promise<PaginatedComments>;

  /**
   * Get comment by ID
   */
  getCommentById(commentId: string): Promise<Comment>;

  /**
   * Create new comment
   */
  createComment(data: CreateCommentData): Promise<Comment>;

  /**
   * Update comment
   */
  updateComment(data: UpdateCommentData): Promise<Comment>;

  /**
   * Delete comment
   */
  deleteComment(commentId: string): Promise<void>;

  /**
   * Toggle like on comment
   */
  toggleLike(commentId: string): Promise<{ liked: boolean; likesCount: number }>;

  /**
   * Upload images
   */
  uploadImages(files: File[]): Promise<{ urls: string[]; publicIds: string[] }>;
}
