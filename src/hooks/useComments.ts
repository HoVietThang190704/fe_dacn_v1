import { useState, useCallback } from 'react';
import { Comment, CreateCommentData } from '@/domain/entities/Comment';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await postCommentContainer
        .getCommentsByPostIdUseCase
        .execute(postId);

      setComments(result.comments);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải bình luận';
      setError(errorMessage);
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const createComment = useCallback(async (data: CreateCommentData): Promise<Comment> => {
    try {
      const newComment = await postCommentContainer
        .createCommentUseCase
        .execute(data);

      // Add comment to appropriate place in the tree
      if (!data.parentCommentId) {
        // Top-level comment
        setComments((prev) => [newComment, ...prev]);
      } else {
        // Reply - update parent comment's replies array
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === data.parentCommentId) {
              return {
                ...c,
                replies: c.replies ? [newComment, ...c.replies] : [newComment],
                repliesCount: c.repliesCount + 1,
              };
            }
            // Check nested replies (level 2)
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === data.parentCommentId
                    ? {
                        ...r,
                        replies: r.replies ? [newComment, ...r.replies] : [newComment],
                        repliesCount: r.repliesCount + 1,
                      }
                    : r
                ),
              };
            }
            return c;
          })
        );
      }

      return newComment;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tạo bình luận';
      throw new Error(errorMessage);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      await postCommentContainer
        .deleteCommentUseCase
        .execute(commentId);

      // Remove comment from tree
      setComments((prev) => {
        // Helper to recursively remove comment
        const removeFromTree = (comments: Comment[]): Comment[] => {
          return comments
            .filter((c) => c.id !== commentId)
            .map((c) => ({
              ...c,
              replies: c.replies ? removeFromTree(c.replies) : undefined,
            }));
        };
        return removeFromTree(prev);
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi xóa bình luận';
      throw new Error(errorMessage);
    }
  }, []);

  const toggleLike = useCallback(async (commentId: string) => {
    try {
      const result = await postCommentContainer
        .toggleLikeCommentUseCase
        .execute(commentId);

      // Update comment in tree
      setComments((prev) => {
        const updateInTree = (comments: Comment[]): Comment[] => {
          return comments.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                isLiked: result.liked,
                likesCount: result.likesCount,
              };
            }
            if (c.replies) {
              return {
                ...c,
                replies: updateInTree(c.replies),
              };
            }
            return c;
          });
        };
        return updateInTree(prev);
      });

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi like bình luận';
      throw new Error(errorMessage);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadComments();
  }, [loadComments]);

  return {
    comments,
    isLoading,
    error,
    loadComments,
    createComment,
    deleteComment,
    toggleLike,
    refresh,
  };
}
