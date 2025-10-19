'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCommunityViewModel } from '../viewmodels/useCommunityViewModel';
import { container } from '../di/container';
import { CommunityPost } from '@/domain/entities/Community';

export const CommunityPage: React.FC = () => {
  const t = useTranslations('community');
  // Comment out API calls - using mock data for UI preview
  // const viewModel = useCommunityViewModel(container.getCommunityPostsUseCase);
  // if (viewModel.isLoading && viewModel.posts.length === 0) {
  //   return <LoadingState />;
  // }
  // if (viewModel.error) {
  //   return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} />;
  // }

  // Mock data for UI preview - Shopee style community
  const mockPosts: CommunityPost[] = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Nguyễn Văn A',
      userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      createdAt: new Date() as any,
      content: 'Vừa nhận được đơn hàng từ Fresh Market! Trái cây tươi ngon quá, giá lại hợp lý nữa. Ae nào chưa mua thử đi! 🥰',
      images: [
        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
      ],
      likes: 234,
      comments: 56,
      shares: 12,
      isLiked: false
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Lê Thị B',
      userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      createdAt: new Date(Date.now() - 3600000) as any,
      content: 'Review sản phẩm nào! Mình mới mua nho Úc ở Fresh Market, ngọt lịm luôn 🍇 Giá tốt hơn siêu thị nhiều. Recommend mọi người nên thử!',
      images: [
        'https://images.unsplash.com/photo-1599819177360-6eede6b5a6f7?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=600&q=80',
      ],
      likes: 189,
      comments: 32,
      shares: 8,
      isLiked: true
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Trần Văn C',
      userAvatar: 'https://randomuser.me/api/portraits/men/65.jpg',
      createdAt: new Date(Date.now() - 7200000) as any,
      content: 'Mình đang tìm nơi bán rau củ sạch, có ae nào dùng Fresh Market chưa? Chất lượng thế nào?',
      images: [],
      likes: 45,
      comments: 78,
      shares: 3,
      isLiked: false
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('title')}</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">A</div>
          <button className="flex-1 text-left px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-500 hover:bg-gray-200 transition-colors">{t('placeholder')}</button>
        </div>
      </div>
      <div className="space-y-3">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post as any} />
        ))}
      </div>
    </div>
  );
};
const PostCard: React.FC<{ post: CommunityPost }> = ({ post }) => {
  return (
    <div className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={post.userAvatar}
            alt={post.userName}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-sm sm:text-base">{post.userName}</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {new Date(post.createdAt as any).toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'short',
              })}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <span className="text-gray-500">...</span>
        </button>
      </div>
      <div className="px-3 sm:px-4 pb-2">
        <p className="text-sm sm:text-base text-gray-800">{post.content}</p>
      </div>
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-0.5 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="w-full h-48 sm:h-64 object-cover cursor-pointer"
            />
          ))}
        </div>
      )}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-xs sm:text-sm text-gray-500 border-t">
        <div className="flex items-center gap-1">
          <span className="text-red-500">❤️</span>
          <span>{post.likes.toLocaleString()}</span>
        </div>
        <div className="flex gap-4">
          <span>{post.comments.toLocaleString()} bình luận</span>
          <span>{post.shares.toLocaleString()} chia sẻ</span>
        </div>
      </div>
      <div className="px-4 pb-3 flex gap-2 border-t pt-2">
        <button
          className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            post.isLiked
              ? 'text-red-500 hover:bg-red-50'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <svg className="w-5 h-5" fill={post.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>Thích</span>
        </button>
        <button className="flex-1 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>Bình luận</span>
        </button>
        <button className="flex-1 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>Chia sẻ</span>
        </button>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Đang tải bài viết...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="text-center py-12 bg-white rounded-lg">
    <div className="text-red-500 text-5xl mb-4">⚠️</div>
    <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
    <p className="text-gray-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      Thử lại
    </button>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12 bg-white rounded-lg">
    <div className="text-gray-400 text-6xl mb-4">📝</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bài viết nào</h3>
    <p className="text-gray-500 mb-6">Hãy là người đầu tiên chia sẻ!</p>
  </div>
);
