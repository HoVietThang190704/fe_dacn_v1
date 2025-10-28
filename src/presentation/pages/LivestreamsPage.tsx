import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';

export const LivestreamsPage: React.FC = () => {
  const t = useTranslations('livestream');

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

  const [activeTab, setActiveTab] = React.useState<'live' | 'scheduled'>('live');
  const activeLivestreams = mockLivestreams.filter(l => l.status === LivestreamStatus.LIVE);
  const scheduledLivestreams = mockLivestreams.filter(l => l.status === LivestreamStatus.SCHEDULED);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Hero Section (compact) */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white py-6 sm:py-8 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-snug">
                {t('title')}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-emerald-100 max-w-xl leading-relaxed">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex-shrink-0 flex items-center gap-3 mt-3 sm:mt-0">
              <button aria-label={t('create')} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-full font-semibold shadow hover:shadow-lg transition transform hover:-translate-y-0.5">
                <svg className="w-4 h-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">{t('create')}</span>
              </button>

              <button aria-label={t('history')} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path d="M3 7h18M3 12h18M3 17h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">{t('history')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="bg-white rounded-full p-1 sm:p-2 shadow-lg border border-gray-100 flex gap-1 sm:gap-2 w-full max-w-md sm:max-w-none">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none ${
                activeTab === 'live'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${activeTab === 'live' ? 'bg-white animate-pulse' : 'bg-red-500'}`}></div>
              <span className="truncate">{t('liveTab', { count: activeLivestreams.length })}</span>
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-4 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none ${
                activeTab === 'scheduled'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-green-500 hover:bg-green-50'
              }`}
            >
              <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${activeTab === 'scheduled' ? 'bg-white' : 'bg-green-500'}`}></div>
              <span className="truncate">{t('scheduledTab', { count: scheduledLivestreams.length })}</span>
            </button>
          </div>
        </div>

        {/* Livestream Grid */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'live' ? (
            activeLivestreams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {activeLivestreams.map((livestream) => (
                  <LivestreamCard key={livestream.id} livestream={livestream} t={t} />
                ))}
              </div>
            ) : (
              <EmptyState message={t('noLive')} t={t} />
            )
          ) : scheduledLivestreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {scheduledLivestreams.map((livestream) => (
                <LivestreamCard key={livestream.id} livestream={livestream} t={t} />
              ))}
            </div>
          ) : (
            <EmptyState message={t('noScheduled')} t={t} />
          )}
        </div>
      </div>
    </div>
  );
};

const LivestreamCard: React.FC<{ livestream: Livestream; t: (key: string) => string }> = ({ livestream, t }) => {
  const isLive = livestream.status === LivestreamStatus.LIVE;

  return (
    <Link href={`/main/livestream/${livestream.id}`}>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group transform hover:-translate-y-2">
        <div className="relative">
          <Image
            src={livestream.thumbnail}
            alt={livestream.title}
            width={400}
            height={192}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {isLive ? (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              {t('liveBadge')}
            </div>
          ) : (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              {t('upcomingBadge')}
            </div>
          )}
          {isLive && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
              👁️ {livestream.viewerCount.toLocaleString()}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
              <svg
                className="w-10 h-10 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 line-clamp-2 text-gray-800 group-hover:text-purple-600 transition-colors">
            {livestream.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {livestream.description}
          </p>

          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Image
              src={livestream.hostAvatar}
              alt={livestream.hostName}
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-purple-100"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs sm:text-sm text-gray-800 truncate">{livestream.hostName}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                {isLive
                  ? t('live')
                  : `${t('scheduled')} ${new Date(livestream.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`}
              </div>
            </div>
          </div>

          {livestream.products.length > 0 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-600 font-medium">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-100 rounded-full flex items-center justify-center">
                🛍️
              </div>
              {livestream.products.length} {t('products')}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const EmptyState: React.FC<{ message: string; t: (key: string) => string }> = ({ message, t }) => (
  <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-lg max-w-2xl mx-auto px-4 sm:px-6">
    <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 animate-bounce">📹</div>
    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{message}</h3>
    <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8">{t('pleaseComeBack')}</p>
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
      <button className="px-4 sm:px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-semibold">
        {t('create')}
      </button>
      <button className="px-4 sm:px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors font-semibold">
        {t('history')}
      </button>
    </div>
  </div>
);