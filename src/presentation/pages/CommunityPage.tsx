'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { CommunityPost } from '@/domain/entities/Community';
import { CreatePostPopup } from '@/components/ui/CreatePostPopup';

export const CommunityPage: React.FC = () => {
  const t = useTranslations('community');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // Comment out API calls - using mock data for UI preview
  // const viewModel = useCommunityViewModel(
  //   container.getCommunityPostsUseCase,
  //   container.createCommunityPostUseCase
  // );

  // Mock data for UI preview
  const mockPosts = [
    {
      id: 'post1',
      userId: 'user1',
      userName: 'Nguyễn Thị Mai',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80',
      content: 'Hôm nay mình vừa nhận được lô cam sành Cao Phong siêu ngọt từ Fresh Market! Cam to tròn, vỏ mỏng, nước nhiều. Giá cả phải chăng nữa. Ai đã thử chưa? 😍',
      images: [
        'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=400&q=80'
      ],
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: 'post2',
      userId: 'user2',
      userName: 'Trần Văn Hùng',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      content: 'Mình vừa thử táo Envy New Zealand từ Fresh Market. Táo giòn, ngọt thanh, không có vị chát. Đặc biệt là táo còn tươi ngon sau 1 tuần bảo quản trong tủ lạnh. Highly recommend! 🍎',
      images: [
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80'
      ],
      likes: 45,
      comments: 12,
      shares: 7,
      isLiked: true,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: 'post3',
      userId: 'user3',
      userName: 'Lê Thị Linh',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      content: 'Hôm qua mình mua nho xanh không hạt Úc về làm salad. Nho to, căng mọng, vị ngọt tự nhiên. Gia đình mình ăn hết sạch trong 1 buổi tối luôn! 😋',
      images: [],
      likes: 18,
      comments: 5,
      shares: 2,
      isLiked: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: 'post4',
      userId: 'user4',
      userName: 'Phạm Minh Tuấn',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      content: 'Fresh Market có chương trình khuyến mãi dâu tây Đà Lạt hữu cơ. Giá chỉ 95k/hộp 250g, giảm 21%. Ai muốn mua chung không? Inbox mình nhé! 🍓',
      images: [
        'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80'
      ],
      likes: 32,
      comments: 15,
      shares: 5,
      isLiked: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      id: 'post5',
      userId: 'user5',
      userName: 'Hoàng Thị Lan',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      content: 'Mình vừa thử cà chua cherry Đà Lạt từ Fresh Market. Cà to, màu đỏ đẹp, vị ngọt đậm đà. Ăn sống cũng ngon, nấu canh cũng tuyệt! 👍',
      images: [
        'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&q=80'
      ],
      likes: 28,
      comments: 9,
      shares: 4,
      isLiked: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }
  ];

  const handleCreatePost = async (content: string) => {
    // For now, use mock userId - in real app, get from auth context
    const mockUserId = 'user1';
    // Comment out API call
    // await viewModel.createPost({ userId: mockUserId, content, images: [] });
    console.log('Creating post:', { userId: mockUserId, content });
  };

  // Comment out loading/error states
  // if (viewModel.isLoading && viewModel.posts.length === 0) {
  //   return <LoadingState />;
  // }
  // if (viewModel.error) {
  //   return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} />;
  // }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Create Post Section */}
      <div className="bg-white border-b border-gray-200 p-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">A</div>
          <button
            onClick={() => setIsPopupOpen(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-100 rounded-full text-sm text-gray-500 hover:bg-gray-200 transition-colors"
          >
            {t('placeholder')}
          </button>
        </div>
      </div>

  {/* Posts Feed - add horizontal padding on larger screens so posts have whitespace left/right */}
  <div className="pb-4 px-4 md:px-8 lg:px-16 xl:px-24">
        {mockPosts.length > 0 ? (
          mockPosts.map((post) => (
            <PostCard key={post.id} post={post} t={t} />
          ))
        ) : (
          <EmptyState t={t} />
        )}
      </div>

      <CreatePostPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleCreatePost}
        isLoading={false}
      />
    </div>
  );
};
const PostCard: React.FC<{ post: CommunityPost; t: (key: string) => string }> = ({ post, t }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={post.userAvatar}
            alt={post.userName}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-gray-900 truncate">{post.userName}</h3>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'short',
                ...(new Date(post.createdAt).getFullYear() !== new Date().getFullYear() && {
                  year: 'numeric'
                })
              })}
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-3">
          {post.images.length === 1 ? (
            <div className="relative">
              <Image
                src={post.images[0]}
                alt="Post image"
                width={600}
                height={400}
                className="w-full max-h-96 object-cover cursor-pointer"
              />
            </div>
          ) : post.images.length === 2 ? (
            <div className="grid grid-cols-2 gap-1">
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Post image ${index + 1}`}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover cursor-pointer"
                />
              ))}
            </div>
          ) : post.images.length === 3 ? (
            <div className="grid grid-cols-2 gap-1">
              <Image
                src={post.images[0]}
                alt="Post image 1"
                width={300}
                height={400}
                className="w-full h-96 object-cover cursor-pointer row-span-2"
              />
              <Image
                src={post.images[1]}
                alt="Post image 2"
                width={300}
                height={200}
                className="w-full h-48 object-cover cursor-pointer"
              />
              <Image
                src={post.images[2]}
                alt="Post image 3"
                width={300}
                height={200}
                className="w-full h-48 object-cover cursor-pointer"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image}
                    alt={`Post image ${index + 1}`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover cursor-pointer"
                  />
                  {index === 3 && post.images.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">+{post.images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Stats */}
      {(post.likes > 0 || post.comments > 0 || post.shares > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {post.likes > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">♥</span>
                </div>
                <span>{post.likes.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            {post.comments > 0 && <span>{post.comments.toLocaleString()} {t('comments')}</span>}
            {post.shares > 0 && <span>{post.shares.toLocaleString()} {t('shares')}</span>}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-2 py-1 flex gap-1">
        <button
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 hover:bg-gray-100 ${
            post.isLiked ? 'text-red-500' : 'text-gray-600'
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
          <span className="text-sm">{t('like')}</span>
        </button>
        <button className="flex-1 py-2 px-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm">{t('comment')}</span>
        </button>
        <button className="flex-1 py-2 px-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span className="text-sm">{t('share')}</span>
        </button>
      </div>
    </div>
  );
};

const LoadingState: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{t('loading')}</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void; t: (key: string) => string }> = ({ error, onRetry, t }) => (
  <div className="text-center py-12 bg-white rounded-lg">
    <div className="text-red-500 text-5xl mb-4">⚠️</div>
    <h2 className="text-xl font-semibold mb-2">{t('error')}</h2>
    <p className="text-gray-600 mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      {t('retry')}
    </button>
  </div>
);

const EmptyState: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="bg-white border-b border-gray-200 p-8 text-center">
    <div className="text-gray-400 text-6xl mb-4">📝</div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('emptyTitle')}</h3>
    <p className="text-gray-500">{t('emptyDesc')}</p>
  </div>
);
