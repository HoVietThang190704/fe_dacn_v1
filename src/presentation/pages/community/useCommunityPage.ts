import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/hooks/useAuth';
import { usePosts } from '@/hooks/usePosts';
import { CreatePostData } from '@/domain/entities/Post';
import { COMMUNITY_CONFIG } from './community.config';

export const useCommunityPage = () => {
  const t = useTranslations('community');
  const { user } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    createPost,
    toggleLike,
    sharePost,
    deletePost,
    refresh,
  } = usePosts();

  const handleCreatePost = useCallback(async (content: string, images?: File[]) => {
    try {
      setIsCreatingPost(true);
      const postData: CreatePostData = {
        content,
        images: images || [],
        visibility: 'public',
      };
      await createPost(postData);
      setIsPopupOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('error');
      alert(message);
    } finally {
      setIsCreatingPost(false);
    }
  }, [createPost, t]);

  const handleToggleLike = useCallback(async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (err) {
    }
  }, [toggleLike]);

  const handleDeletePost = useCallback(async (postId: string) => {
    const confirmed = confirm(t('confirmDelete'));
    if (!confirmed) return;
    try {
      await deletePost(postId);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('error');
      alert(message);
    }
  }, [deletePost, t]);

  const handleSharePost = useCallback(async (originalPostId: string, content?: string) => {
    try {
      await sharePost(originalPostId, content);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('error');
      alert(message);
    }
  }, [sharePost, t]);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: COMMUNITY_CONFIG.OBSERVER_ROOT_MARGIN,
      threshold: COMMUNITY_CONFIG.OBSERVER_THRESHOLD,
    });
    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => { if (currentTarget) observer.unobserve(currentTarget); };
  }, [handleIntersection]);

  return {
    t,
    user,
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    isPopupOpen,
    setIsPopupOpen,
    isCreatingPost,
    observerTarget,
    handleCreatePost,
    handleToggleLike,
    handleDeletePost,
    handleSharePost,
    refresh,
    SKELETON_COUNT: COMMUNITY_CONFIG.SKELETON_COUNT,
  } as const;
};

export default useCommunityPage;
