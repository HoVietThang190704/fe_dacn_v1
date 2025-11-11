'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CreatePostPopup } from '@/components/ui/CreatePostPopup';
import Image from 'next/image';
import { useAuth } from '@/shared/hooks/useAuth';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import { usePosts } from '@/hooks/usePosts';
import { CreatePostData } from '@/domain/entities/Post';

export const CommunityPage: React.FC = () => {
  const t = useTranslations('community');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Use real API data via usePosts hook
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

  const { user } = useAuth();

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCreatePost = async (content: string, images?: File[]) => {
    try {
      setIsCreatingPost(true);
      
      const postData: CreatePostData = {
        content,
        images: images || [],
        visibility: 'public', // Default to public
      };

      await createPost(postData);
      setIsPopupOpen(false);
    } catch (err) {
      console.error('Error creating post:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi tạo bài viết');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    
    try {
      await deletePost(postId);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa bài viết');
    }
  };

  const handleSharePost = async (originalPostId: string, content?: string) => {
    try {
      await sharePost(originalPostId, content);
    } catch (err) {
      console.error('Error sharing post:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi chia sẻ bài viết');
    }
  };

  // Infinite Scroll with IntersectionObserver
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '100px', // Start loading 100px before reaching the bottom
      threshold: 0.1,
    });

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [handleIntersection]);

  // Loading state - show skeleton
  if (isLoading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="pb-4 px-4 md:px-8 lg:px-16 xl:px-24">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm mb-4 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="h-20 bg-gray-200 rounded mb-4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Create Post Section - Simplified Design */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="pb-4 px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="max-w-full mx-auto pt-4">
            <div className="flex items-center gap-3">
              {/* Use authenticated user avatar when available, otherwise fallback to first post user or initials */}
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.userName || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover shadow-md flex-shrink-0"
                />
              ) : (posts[0]?.user?.avatar ? (
                <Image
                  src={posts[0]?.user?.avatar}
                  alt={posts[0]?.user?.userName || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full object-cover shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                  {getInitials(user?.userName || posts[0]?.user?.userName || 'U') || 'U'}
                </div>
              ))}

              <button
                onClick={() => setIsPopupOpen(true)}
                className="flex-1 text-left px-4 py-3 bg-gray-100 rounded-full text-sm text-gray-500 hover:bg-gray-200 transition-all hover:shadow-sm"
              >
                {user?.userName ? `${user.userName} ơi, bạn đang nghĩ gì thế?` : (t('placeholder') || 'Bạn đang nghĩ gì?')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="pb-4 px-4 md:px-8 lg:px-16 xl:px-24">
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  userId: post.userId,
                  userName: post.user?.userName || post.user?.email || 'Unknown User',
                  userAvatar: post.user?.avatar || '',
                  userEmail: post.user?.email,
                  content: post.content,
                  images: post.images,
                  likes: post.likesCount,
                  comments: post.commentsCount,
                  shares: post.sharesCount,
                  isLiked: post.isLiked,
                  createdAt: post.createdAt,
                }}
                t={t}
                onLike={() => handleToggleLike(post.id)}
                onDelete={() => handleDeletePost(post.id)}
                onShare={() => handleSharePost(post.id)}
              />
            ))}
            
            {/* Intersection Observer Target - Load more when visible */}
            {hasMore && (
              <div ref={observerTarget} className="text-center py-4">
                {isLoadingMore && (
                  <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            )}
            
            {/* End of Feed */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-4 text-gray-500">
                Đã hiển thị tất cả bài viết
              </div>
            )}
          </>
        ) : (
          <EmptyState t={t} />
        )}
      </div>

      <CreatePostPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleCreatePost}
        isLoading={isCreatingPost}
      />
    </div>
  );
};
