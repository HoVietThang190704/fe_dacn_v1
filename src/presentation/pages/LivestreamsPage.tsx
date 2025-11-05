"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/shared/hooks/useAuth';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';
import { container } from '@/presentation/di/container';

export const LivestreamsPage: React.FC = () => {
  const t = useTranslations('livestream');
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = React.useState<'live' | 'scheduled'>('live');
  const [activeLivestreams, setActiveLivestreams] = React.useState<Livestream[]>([]);
  const [scheduledLivestreams, setScheduledLivestreams] = React.useState<Livestream[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    loadLivestreams();
  }, []);

  const loadLivestreams = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const getLivestreamsUseCase = container.getLivestreamsUseCase;
      const data = await getLivestreamsUseCase.execute();
      setActiveLivestreams(data.active);
      setScheduledLivestreams(data.scheduled);
    } catch (err) {
      console.error('Load livestreams error:', err);
      setError(t('errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleStartStream = (livestreamId: string) => {
    router.push(`/main/livestream/${livestreamId}/host`);
  };

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
              <button onClick={() => router.push('/main/livestream/create')} aria-label={t('create')} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-full font-semibold shadow hover:shadow-lg transition transform hover:-translate-y-0.5">
                <svg className="w-4 h-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">{t('create')}</span>
              </button>

              <button 
                onClick={() => router.push('/main/livestream/history')}
                aria-label={t('history')} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-sm">{t('history')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-12">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('loading')}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-2xl mx-auto">
            <p className="text-center">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
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
                  <LivestreamCard 
                    key={livestream.id} 
                    livestream={livestream} 
                    t={t} 
                    currentUserId={user?.id}
                    onStartStream={handleStartStream}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message={t('noLive')} t={t} />
            )
          ) : scheduledLivestreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {scheduledLivestreams.map((livestream) => (
                <LivestreamCard 
                  key={livestream.id} 
                  livestream={livestream} 
                  t={t} 
                  currentUserId={user?.id}
                  onStartStream={handleStartStream}
                />
              ))}
            </div>
          ) : (
            <EmptyState message={t('noScheduled')} t={t} />
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

const LivestreamCard: React.FC<{ livestream: Livestream; t: (key: string) => string; currentUserId?: string; onStartStream?: (id: string) => void }> = ({ livestream, t, currentUserId, onStartStream }) => {
  const isLive = livestream.status === LivestreamStatus.LIVE;
  const isScheduled = livestream.status === LivestreamStatus.SCHEDULED;
  const isMyStream = currentUserId && livestream.hostId === currentUserId;
  const thumbnailUrl = livestream.thumbnail || '/img/products/placeholder.jpg';
  const hostAvatar = livestream.hostAvatar || '/icons/avatar.jpg';

  const handleStartStream = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStartStream && livestream.id) {
      onStartStream(livestream.id);
    }
  };

  return (
    <Link href={`/main/livestream/${livestream.id}`}>
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group transform hover:-translate-y-2">
        <div className="relative">
          <Image
            src={thumbnailUrl}
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
              src={hostAvatar}
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
                  : livestream.startTime
                  ? `${t('scheduled')} ${new Date(livestream.startTime).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : t('scheduled')}
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

          {/* Start Stream Button for Scheduled Streams */}
          {isScheduled && isMyStream && onStartStream && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleStartStream}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                Bắt đầu phát
              </button>
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
  </div>
);