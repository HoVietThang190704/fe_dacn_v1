"use client";

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import type { UserProfile } from '@/presentation/viewmodels/useProfileViewModel';
import { usePostsByUser } from '@/hooks/usePostsByUser';
import { useUserProducts } from '@/hooks/useUserProducts';
import PostCard from '../components/PostCard';
import ProfileProductCard from '../components/ProfileProductCard';
import ProfileHeader from '@/presentation/components/UserTargetPage/ProfileHeader';
import Tabs from '@/presentation/components/UserTargetPage/Tabs';
import EmptyState from '@/presentation/components/UserTargetPage/EmptyState';
import { useAuth } from '@/shared/hooks/useAuth';

interface UserTargetPageProps {
  userId: string;
  fallbackProfile?: Partial<UserProfile>;
}


export const UserTargetPage: React.FC<UserTargetPageProps> = ({ userId, fallbackProfile }) => {
  const tCommunity = useTranslations('community');
  const tProfile = useTranslations('profile');
  const tSearch = useTranslations('search');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'products'>('posts');
  const { user: currentUser } = useAuth();

  const {
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
  } = usePostsByUser(userId);

  const {
    products,
    isLoading: isLoadingProducts,
  } = useUserProducts(userId);

  const profile: UserProfile = useMemo(() => {
    const postUser = posts.find((post) => post.user)?.user;
    const productOwner = products.find((product) => product.owner)?.owner;
    const fallbackName = fallbackProfile?.userName || fallbackProfile?.email || tProfile('userFallback');

    return {
      id: userId,
      userName: postUser?.userName || productOwner?.userName || fallbackName,
      email: postUser?.email || productOwner?.email || fallbackProfile?.email || '',
      avatar: postUser?.avatar || productOwner?.avatar || fallbackProfile?.avatar,
      phone: fallbackProfile?.phone,
      role: fallbackProfile?.role,
      isVerified: fallbackProfile?.isVerified,
    };
  }, [fallbackProfile, posts, products, userId, tProfile]);

  const userPosts = posts;

  const renderPostsSection = () => {
    if (isLoading && userPosts.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (error && userPosts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={refresh} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            {tCommunity('retry')}
          </button>
        </div>
      );
    }

    if (userPosts.length > 0) {
      return (
        <>
          {userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                userId: post.userId,
                userName: post.user?.userName || post.user?.email || tProfile('userFallback'),
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
              
              onLike={() => handleToggleLike(post.id)}
              onShare={(content) => handleSharePost(post.id, content)}
              onDelete={() => handleDeletePost(post.id)}
            />
          ))}

          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60"
              >
                {isLoadingMore ? tCommunity('loading') : tSearch('results.loadMore')}
              </button>
            </div>
          )}
        </>
      );
    }

    return <EmptyState title={tCommunity('emptyTitle')} description={tCommunity('emptyDesc')} iconName={'PLACEHOLDER'} />;
  };

  const renderProductsSection = () => {
    if (isLoadingProducts && products.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (products.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProfileProductCard
              key={product.id}
              product={product}
              router={router}
              onEdit={currentUser?.id === userId ? handleEditProduct : undefined}
            />
          ))}
        </div>
      );
    }

    return <EmptyState title={tProfile('emptyProducts')} description={undefined} iconName={'PLACEHOLDER'} />;
  };

  const handleToggleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
    } catch (err) {
      console.error('[UserTargetPage] toggleLike error:', err);
    }
  };

  const handleSharePost = async (postId: string, content?: string) => {
    try {
      await sharePost(postId, content);
    } catch (err) {
      console.error('[UserTargetPage] sharePost error:', err);
      alert(err instanceof Error ? err.message : tCommunity('error'));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm(tCommunity('confirmDeletePost'))) {
      return;
    }

    try {
      await deletePost(postId);
    } catch (err) {
      console.error('[UserTargetPage] deletePost error:', err);
      alert(err instanceof Error ? err.message : tCommunity('deletePost'));
    }
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/main/products/${productId}/edit`);
  };

  

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader profile={profile} />
      <Tabs active={activeTab} postsCount={userPosts.length} productsCount={products.length} onChange={setActiveTab} />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'posts' && <div className="space-y-4">{renderPostsSection()}</div>}

        {activeTab === 'products' && <div className="space-y-4">{renderProductsSection()}</div>}
      </div>
    </div>
  );
};

export default UserTargetPage;
