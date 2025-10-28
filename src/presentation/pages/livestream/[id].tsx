'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';

export const LivestreamWatchPage: React.FC<{ livestreamId?: string }> = ({ livestreamId: propLivestreamId }) => {
  const t = useTranslations('livestream');
  const params = useParams();
  const router = useRouter();
  const livestreamId = propLivestreamId || (params.id as string);

  // Mock data - in real app, this would come from API
  const mockLivestream: Livestream = {
    id: livestreamId,
    title: 'Siêu Sale Rau Củ Quả Tươi Sống',
    description: 'Livestream bán rau củ quả tươi sống giá rẻ, freeship toàn quốc! Hãy cùng theo dõi để không bỏ lỡ những ưu đãi hấp dẫn.',
    thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    streamUrl: 'https://example.com/stream1',
    status: LivestreamStatus.LIVE,
    viewerCount: 1200,
    hostName: 'Nguyễn Văn A',
    hostAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    startTime: new Date(),
    products: ['pr1', 'pr2', 'pr3']
  };

  const mockProducts = [
    {
      id: 'pr1',
      name: 'Rau Muống Tươi',
      price: 25000,
      originalPrice: 30000,
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=300&q=80',
      discount: 17
    },
    {
      id: 'pr2',
      name: 'Cà Rốt Đà Lạt',
      price: 35000,
      originalPrice: 40000,
      image: 'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=300&q=80',
      discount: 13
    },
    {
      id: 'pr3',
      name: 'Ớt Chuông Đỏ',
      price: 45000,
      originalPrice: 50000,
      image: 'https://images.unsplash.com/photo-1561136594-7f684819998d?auto=format&fit=crop&w=300&q=80',
      discount: 10
    }
  ];

  const mockComments = [
    { id: 'c1', user: 'Nguyễn Thị B', avatar: 'https://randomuser.me/api/portraits/women/45.jpg', message: 'Rau nhìn tươi quá!', time: '2 phút trước' },
    { id: 'c2', user: 'Trần Văn C', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', message: 'Giá rẻ quá anh ơi!', time: '1 phút trước' },
    { id: 'c3', user: 'Lê Thị D', avatar: 'https://randomuser.me/api/portraits/women/23.jpg', message: 'Mua 2kg rau muống với ạ', time: '30 giây trước' }
  ];

  const [activeTab, setActiveTab] = React.useState<'products' | 'comments'>('products');
  const [isLiked, setIsLiked] = React.useState(false);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [comment, setComment] = React.useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Optimized */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/main/livestream')}
              className="text-gray-600 hover:text-gray-800 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-gray-800 truncate leading-tight">{mockLivestream.title}</h1>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>LIVE</span>
                <span>•</span>
                <span>{mockLivestream.viewerCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-0 sm:px-4 lg:px-6">
        {/* Mobile Layout - Video Full Width */}
        <div className="block lg:hidden">
          {/* Video Player - Full Width Mobile */}
          <div className="relative">
            <div className="bg-black overflow-hidden">
              <div className="relative aspect-[9/16] sm:aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center text-white px-6">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l8-5-8-5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{t('title')}</h3>
                  <p className="text-sm text-gray-300">{t('pleaseComeBack')}</p>
                </div>

                {/* Live Badge */}
                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  {t('liveBadge')}
                </div>

                {/* Viewer Count */}
                <div className="absolute top-3 right-3 bg-black bg-opacity-80 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  👁️ {mockLivestream.viewerCount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Stream Info - Mobile Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
              <div className="flex items-center gap-3 mb-3">
                <Image
                  src={mockLivestream.hostAvatar}
                  alt={mockLivestream.hostName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{mockLivestream.hostName}</h3>
                  <p className="text-gray-200 text-xs truncate">{mockLivestream.title}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {isFollowing ? t('following') : t('follow')}
                  </button>
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full transition-colors ${
                      isLiked ? 'bg-red-100 text-red-600' : 'bg-white/20 text-white hover:bg-red-100 hover:text-red-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Action Buttons - Mobile */}
              <div className="flex gap-2">
                <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-full font-semibold hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
                  </svg>
                  {t('shopNow')}
                </button>
                <button className="px-3 py-2 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <button className="px-3 py-2 bg-white/20 text-white rounded-full font-semibold hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="bg-white border-b sticky top-[73px] z-10">
            <div className="flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
                  activeTab === 'products'
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                🛍️ {t('products')} ({mockProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
                  activeTab === 'comments'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                💬 {t('comments')} ({mockComments.length})
              </button>
            </div>
          </div>

          {/* Mobile Tab Content */}
          <div className="bg-gray-50 min-h-screen">
            {activeTab === 'products' ? (
              <div className="p-4">
                <div className="space-y-3">
                  {mockProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex gap-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 mb-2 leading-tight">{product.name}</h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-purple-600 font-bold text-lg">{product.price.toLocaleString()}đ</span>
                            <span className="text-gray-400 text-sm line-through">{product.originalPrice.toLocaleString()}đ</span>
                          </div>
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-semibold">
                            -{product.discount}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4">
                {/* Comment Input - Mobile */}
                <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <div className="flex gap-3">
                    <Image
                      src="https://randomuser.me/api/portraits/women/32.jpg"
                      alt="You"
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('writeComment')}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && setComment('')}
                      />
                    </div>
                  </div>
                </div>

                {/* Comments List - Mobile Chat Style */}
                <div className="space-y-4">
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Image
                        src={comment.avatar}
                        alt={comment.user}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1"
                      />
                      <div className="flex-1">
                        <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                          <div className="font-semibold text-sm text-gray-800 mb-1">{comment.user}</div>
                          <div className="text-gray-700 text-sm leading-relaxed">{comment.message}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 ml-2">{comment.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Stream */}
            <div className="lg:col-span-3 order-1 lg:order-1">
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                {/* Video Player Placeholder */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                  <div className="text-center text-white px-6">
                    <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 5v10l8-5-8-5z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t('title')}</h3>
                    <p className="text-base text-gray-300">{t('pleaseComeBack')}</p>
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    {t('liveBadge')}
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    👁️ {mockLivestream.viewerCount.toLocaleString()}
                  </div>
                </div>

                {/* Stream Info */}
                <div className="p-6 bg-white">
                  <div className="flex items-start gap-4 mb-4">
                    <Image
                      src={mockLivestream.hostAvatar}
                      alt={mockLivestream.hostName}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-100 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{mockLivestream.title}</h2>
                      <p className="text-base text-gray-600 mb-3 leading-relaxed">{mockLivestream.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-800">{mockLivestream.hostName}</span>
                        <button
                          onClick={() => setIsFollowing(!isFollowing)}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                            isFollowing
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {isFollowing ? t('following') : t('follow')}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className={`p-3 rounded-full transition-colors ${
                        isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-full font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
                      </svg>
                      {t('shopNow')}
                    </button>
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-2">
              {/* Products */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {t('products')} ({mockProducts.length})
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mockProducts.map((product) => (
                    <div key={product.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={60}
                        height={60}
                        className="w-15 h-15 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-purple-600 font-bold text-sm">{product.price.toLocaleString()}đ</span>
                          <span className="text-gray-400 text-xs line-through">{product.originalPrice.toLocaleString()}đ</span>
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-semibold">
                            -{product.discount}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {t('comments')} ({mockComments.length})
                </h3>

                {/* Comment Input */}
                <div className="flex gap-3 mb-4">
                  <Image
                    src="https://randomuser.me/api/portraits/women/32.jpg"
                    alt="You"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t('writeComment')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && setComment('')}
                    />
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {mockComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Image
                        src={comment.avatar}
                        alt={comment.user}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2">
                          <div className="font-semibold text-sm text-gray-800">{comment.user}</div>
                          <div className="text-gray-700 text-sm">{comment.message}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{comment.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};