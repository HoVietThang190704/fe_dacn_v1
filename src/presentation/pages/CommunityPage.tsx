'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreatePostPopup } from '@/components/ui/CreatePostPopup';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

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
