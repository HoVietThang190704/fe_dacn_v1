import { useState, useEffect, useCallback } from 'react';
import { Post, CreatePostData } from '@/domain/entities/Post';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';
import { useAuth } from '@/shared/hooks/useAuth';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10; // Load 10 posts at a time
  const { user } = useAuth();

  const loadPosts = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const result = await postCommentContainer
        .getPublicPostsUseCase
        .execute(pageNum, limit);

      if (append) {
        setPosts((prev) => [...prev, ...result.posts]);
      } else {
        setPosts(result.posts);
      }

      setHasMore(result.pagination.hasMore);
      setPage(pageNum);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải bài viết';
      setError(errorMessage);
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [limit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await loadPosts(page + 1, true);
  }, [hasMore, isLoadingMore, page, loadPosts]);

  const createPost = useCallback(async (data: CreatePostData): Promise<Post> => {
    try {
      const newPost = await postCommentContainer
        .createPostUseCase
        .execute(data);

      // Add new post to the beginning of the list
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tạo bài viết';
      throw new Error(errorMessage);
    }
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await postCommentContainer
        .deletePostUseCase
        .execute(postId);

      // Remove post from list
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi xóa bài viết';
      throw new Error(errorMessage);
    }
  }, []);

  const toggleLike = useCallback(async (postId: string) => {
    try {
      const result = await postCommentContainer
        .toggleLikePostUseCase
        .execute(postId);

      // Update post in list
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: result.liked, likesCount: result.likesCount }
            : p
        )
      );

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi like bài viết';
      throw new Error(errorMessage);
    }
  }, []);

  const sharePost = useCallback(async (originalPostId: string, content?: string) => {
    try {
      const sharedPost = await postCommentContainer
        .sharePostUseCase
        .execute({ originalPostId, content });

      // Add shared post to the beginning
      setPosts((prev) => [sharedPost, ...prev]);

      // Update shares count on original post
      setPosts((prev) =>
        prev.map((p) =>
          p.id === originalPostId
            ? { ...p, sharesCount: p.sharesCount + 1 }
            : p
        )
      );

      return sharedPost;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi chia sẻ bài viết';
      throw new Error(errorMessage);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadPosts(1, false);
  }, [loadPosts]);

  // Reload posts when auth user changes so server can compute isLiked for current user
  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts, user?.id]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    createPost,
    deletePost,
    toggleLike,
    sharePost,
    refresh,
  };
}
