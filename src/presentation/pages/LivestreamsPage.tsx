/**
 * Presentation Layer: Livestreams Page
 * Pure UI component for livestream listing
 */
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useLivestreamsViewModel } from '../viewmodels/useLivestreamsViewModel';
import { container } from '../di/container';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';

export const LivestreamsPage: React.FC = () => {
  const t = useTranslations('livestream');
  const viewModel = useLivestreamsViewModel(container.getLivestreamsUseCase);

//   if (viewModel.isLoading) {
//     return <LoadingState />;
//   }

//   if (viewModel.error) {
//     return <ErrorState error={viewModel.error} onRetry={viewModel.refresh} />;
//   }
const mockLivestreams = [
    {
      id: 'ls1',
      title: 'Siêu Sale Rau Củ Quả Tươi Sống',
      description: 'Livestream bán rau củ quả tươi sống giá rẻ, freeship toàn quốc!',
      thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
      streamUrl: 'https://example.com/stream1',
      status: LivestreamStatus.LIVE,
      viewerCount: 1200,
      hostName: 'Nguyễn Văn A',
      hostAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      startTime: new Date(),
      products: ['pr1']
    },
    {
      id: 'ls2',
      title: 'Trái Cây Nhập Khẩu Giá Sốc',
      description: 'Chuyên trái cây nhập khẩu, giá ưu đãi chỉ có trong livestream này!',
      thumbnail: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80',
      streamUrl: 'https://example.com/stream2',
      status: LivestreamStatus.LIVE,
      viewerCount: 800,
      hostName: 'Lê Thị B',
      hostAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      startTime: new Date(),
      products: ['pr2', 'pr3']
    },
    {
      id: 'ls3',
      title: 'Đặc Sản Miền Tây - Cá, Tôm, Cua',
      description: 'Đặc sản tươi sống miền Tây, giao hàng tận nơi!',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      streamUrl: 'https://example.com/stream3',
      status: LivestreamStatus.SCHEDULED,
      viewerCount: 0,
      hostName: 'Trần Văn C',
      hostAvatar: 'https://randomuser.me/api/portraits/men/65.jpg',
      startTime: new Date(Date.now() + 3600 * 1000),
      products: []
    }
  ];

  // UI state for tab
  const [activeTab, setActiveTab] = React.useState<'live' | 'scheduled'>('live');
  const activeLivestreams = mockLivestreams.filter(l => l.status === LivestreamStatus.LIVE);
  const scheduledLivestreams = mockLivestreams.filter(l => l.status === LivestreamStatus.SCHEDULED);

  return (
    <section className="min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition-colors">{t('create')}</button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition-colors">{t('history')}</button>
        </div>
      </div>

      {/* Tabs activeTab === 'live' này kia phải thêm viewModel  */}
      <div className="bg-white rounded-lg shadow-sm p-2 mb-6 inline-flex gap-2">
        <button
          onClick={() => setActiveTab('live')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'live'
              ? 'bg-red-600 text-white'
              : 'bg-transparent text-gray-700 hover:bg-gray-100'
          }`}
        >
          🔴 {t('liveTab', { count: activeLivestreams.length })}
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'scheduled'
              ? 'bg-green-600 text-white'
              : 'bg-transparent text-gray-700 hover:bg-gray-100'
          }`}
        >
          📅 {t('scheduledTab', { count: scheduledLivestreams.length })}
        </button>
      </div>

      {/* Livestreams Grid */}
      <div className="bg-white rounded-xl shadow p-6">
        {activeTab === 'live' ? (
          activeLivestreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeLivestreams.map((livestream) => (
                <LivestreamCard key={livestream.id} livestream={livestream} />
              ))}
            </div>
          ) : (
            <EmptyState message={t('noLive')} />
          )
        ) : scheduledLivestreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scheduledLivestreams.map((livestream) => (
              <LivestreamCard key={livestream.id} livestream={livestream} />
            ))}
          </div>
        ) : (
          <EmptyState message={t('noScheduled')} />
        )}
      </div>
    </section>
  );
};

// Sub-components
const LivestreamCard: React.FC<{ livestream: Livestream }> = ({ livestream }) => {
  const isLive = livestream.status === LivestreamStatus.LIVE;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer group">
      <div className="relative">
        <img
          src={livestream.thumbnail}
          alt={livestream.title}
          className="w-full h-48 object-cover"
        />
        {isLive ? (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            LIVE
          </div>
        ) : (
          <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            SẮP DIỄN RA
          </div>
        )}
        {isLive && (
          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
            👁️ {livestream.viewerCount.toLocaleString()}
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
            <svg
              className="w-8 h-8 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{livestream.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{livestream.description}</p>

        <div className="flex items-center gap-3 mb-3">
          <img
            src={livestream.hostAvatar}
            alt={livestream.hostName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-sm">{livestream.hostName}</div>
            <div className="text-xs text-gray-500">
              {isLive
                ? 'Đang live'
                : `Bắt đầu ${new Date(livestream.startTime).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
            </div>
          </div>
        </div>

        {livestream.products.length > 0 && (
          <div className="text-xs text-gray-500">
            🛍️ {livestream.products.length} sản phẩm
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Đang tải livestream...</p>
    </div>
  </div>
);

// const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
//   <div className="flex items-center justify-center min-h-screen">
//     <div className="text-center">
//       <div className="text-red-500 text-5xl mb-4">⚠️</div>
//       <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
//       <p className="text-gray-600 mb-4">{error}</p>
//       <button
//         onClick={onRetry}
//         className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//       >
//         Thử lại
//       </button>
//     </div>
//   </div>
// );

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-12 bg-white rounded-lg">
    <div className="text-gray-400 text-6xl mb-4">📹</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">{message}</h3>
    <p className="text-gray-500 mb-6">Vui lòng quay lại sau!</p>
  </div>
);
