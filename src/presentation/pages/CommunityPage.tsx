'use client';

import React from 'react';
import { CreatePostPopup } from '@/components/ui/CreatePostPopup';
import Image from 'next/image';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import useCommunityPage from './community/useCommunityPage';
import { getInitials } from '@/lib/utils';

export const CommunityPage: React.FC = () => {
  const {
    t,
    user,
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    observerTarget,
    isPopupOpen,
    setIsPopupOpen,
    isCreatingPost,
    handleCreatePost,
    handleDeletePost,
    handleToggleLike,
    handleSharePost,
    refresh,
    SKELETON_COUNT,
  } = useCommunityPage();

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
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
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

  if (error && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="pb-4 px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="max-w-full mx-auto pt-4">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.userName || t('userFallback')}
                  width={40}
                  height={40}
                  className="rounded-full object-cover shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                  {getInitials(user?.userName || 'U') || 'U'}
                </div>
              )}

              <button
                onClick={() => setIsPopupOpen(true)}
                className="flex-1 text-left px-4 py-3 bg-gray-100 rounded-full text-sm text-gray-500 hover:bg-gray-200 transition-all hover:shadow-sm"
              >
                {user?.userName ? `${user.userName} ${t('placeholder')}` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-4 px-4 md:px-8 lg:px-12 xl:px-16 xl:mx-40">
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  userId: post.userId,
                  userName: post.user?.userName || post.user?.email || t('unknownUser'),
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
            {hasMore && (
              <div ref={observerTarget} className="text-center py-4">
                {isLoadingMore && (
                  <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-4 text-gray-500">{t('allDisplayed')}</div>
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

