import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Post } from '@/domain/entities/Post';
import { postCommentContainer } from '@/presentation/di/PostCommentContainer';

interface UsePostsByUserOptions {
  limit?: number;
}

interface ToggleLikeResult {
  liked: boolean;
  likesCount: number;
}

interface ShareCallback {
  (originalPostId: string, content?: string): Promise<Post>;
}

export function usePostsByUser(userId: string, options?: UsePostsByUserOptions) {
  const limit = options?.limit ?? 10;
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const canLoad = useMemo(() => Boolean(userId && userId.trim().length > 0), [userId]);

  const loadPosts = useCallback(
    async (pageNumber: number = 1, append: boolean = false) => {
      if (!canLoad) {
        setPosts([]);
        setHasMore(false);
        setPage(1);
        return;
      }

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const result = await postCommentContainer.getUserPostsUseCase.execute(userId, pageNumber, limit);

        setPosts((previous) => (append ? [...previous, ...result.posts] : result.posts));
        setHasMore(result.pagination.hasMore);
        setPage(result.pagination.page);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi khi tải bài viết của người dùng';
        setError(message);
        if (!append) {
          setPosts([]);
          setHasMore(false);
          setPage(1);
        }
        console.error('[usePostsByUser] loadPosts error:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [canLoad, limit, userId],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !canLoad) {
      return;
    }
    await loadPosts(page + 1, true);
  }, [canLoad, hasMore, isLoadingMore, loadPosts, page]);

  const toggleLike = useCallback(async (postId: string): Promise<ToggleLikeResult> => {
    const result = await postCommentContainer.toggleLikePostUseCase.execute(postId);

    setPosts((previous) =>
      previous.map((post) =>
        post.id === postId
          ? { ...post, isLiked: result.liked, likesCount: result.likesCount }
          : post,
      ),
    );

    return result;
  }, []);

  const sharePost: ShareCallback = useCallback(async (originalPostId: string, content?: string) => {
    const sharedPost = await postCommentContainer.sharePostUseCase.execute({ originalPostId, content });

    setPosts((previous) => [sharedPost, ...previous]);
    setPosts((previous) =>
      previous.map((post) =>
        post.id === originalPostId
          ? { ...post, sharesCount: post.sharesCount + 1 }
          : post,
      ),
    );

    return sharedPost;
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await postCommentContainer.deletePostUseCase.execute(postId);
      setPosts((previous) => previous.filter((post) => post.id !== postId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xóa bài viết';
      throw new Error(message);
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadPosts(1, false);
  }, [loadPosts]);

  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    toggleLike,
    sharePost,
    deletePost,
    refresh,
  };
}
