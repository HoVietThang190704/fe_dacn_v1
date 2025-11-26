"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/shared/hooks/useAuth';
import { useLivestreams } from '@/presentation/hooks/useLivestreams';
import LivestreamCard from '@/presentation/components/LivestreamCard';
import LivestreamsEmptyState from '@/presentation/components/livestreams/EmptyState';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';

export const LivestreamsPage: React.FC = () => {
  const t = useTranslations('livestream');
  const router = useRouter();
  const { user } = useAuth();
  const {
    activeLivestreams,
    scheduledLivestreams,
    isLoading,
    error,
  } = useLivestreams();

  const [activeTab, setActiveTab] = React.useState<'live' | 'scheduled'>('live');

  const handleStartStream = (livestreamId: string) => router.push(`/main/livestream/${livestreamId}/host`);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
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
                <Image src={ICONS.PLUS} alt={t('create')} width={16} height={16} className="w-4 h-4 text-emerald-700" />
                <span className="text-sm">{t('create')}</span>
              </button>

              <button 
                onClick={() => router.push('/main/livestream/history')}
                aria-label={t('history')} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition"
              >
                <Image src={ICONS.HISTORY} alt={t('history')} width={16} height={16} className="w-4 h-4" />
                <span className="text-sm">{t('history')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('loading')}</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl max-w-2xl mx-auto">
            <p className="text-center">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
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
              <LivestreamsEmptyState message={t('noLive')} t={t} />
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
            <LivestreamsEmptyState message={t('noScheduled')} t={t} />
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default LivestreamsPage;