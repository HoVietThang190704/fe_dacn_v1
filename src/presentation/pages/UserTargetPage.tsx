'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import type { UserProfile } from '@/presentation/viewmodels/useProfileViewModel';
import { usePostsByUser } from '@/hooks/usePostsByUser';
import { useUserProducts } from '@/hooks/useUserProducts';
import PostCard from '../components/PostCard';
import ProfileProductCard from '../components/ProfileProductCard';
import { useAuth } from '@/shared/hooks/useAuth';

interface UserTargetPageProps {
  userId: string;
  fallbackProfile?: Partial<UserProfile>;
}

const UNKNOWN_USER_NAME = 'Người dùng';
const EMAIL_PLACEHOLDER = 'Chưa cập nhật email';

export const UserTargetPage: React.FC<UserTargetPageProps> = ({ userId, fallbackProfile }) => {
  const tCommunity = useTranslations('community');
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
    const fallbackName = fallbackProfile?.userName || fallbackProfile?.email || UNKNOWN_USER_NAME;

    return {
      id: userId,
      userName: postUser?.userName || productOwner?.userName || fallbackName,
      email: postUser?.email || productOwner?.email || fallbackProfile?.email || '',
      avatar: postUser?.avatar || productOwner?.avatar || fallbackProfile?.avatar,
      phone: fallbackProfile?.phone,
      role: fallbackProfile?.role,
      isVerified: fallbackProfile?.isVerified,
    };
  }, [fallbackProfile, posts, products, userId]);

  const userPosts = posts;

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
      alert(err instanceof Error ? err.message : 'Lỗi khi chia sẻ bài viết');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) {
      return;
    }

    try {
      await deletePost(postId);
    } catch (err) {
      console.error('[UserTargetPage] deletePost error:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa bài viết');
    }
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/main/products/${productId}/edit`);
  };

  const displayEmail = profile.email || EMAIL_PLACEHOLDER;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.userName}
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                {profile.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile.userName}</h1>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{displayEmail}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-2 font-medium text-sm relative ${
                activeTab === 'posts'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bài viết ({userPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-2 font-medium text-sm relative ${
                activeTab === 'products'
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sản phẩm ({products.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {isLoading && userPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error && userPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={refresh}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Thử lại
                </button>
              </div>
            ) : userPosts.length > 0 ? (
              <>
                {userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={{
                      id: post.id,
                      userId: post.userId,
                      userName: post.user?.userName || post.user?.email || UNKNOWN_USER_NAME,
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
                    t={tCommunity}
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
                      {isLoadingMore ? 'Đang tải...' : 'Xem thêm bài viết'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">Chưa có bài viết nào</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            {isLoadingProducts && products.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products.length > 0 ? (
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
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500">Chưa có sản phẩm nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTargetPage;
