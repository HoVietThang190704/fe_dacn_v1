import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';
import { LIVESTREAM_THUMBNAIL_WIDTH, LIVESTREAM_THUMBNAIL_HEIGHT, PLACEHOLDER_THUMBNAIL, PLACEHOLDER_AVATAR, LIVESTREAM_AVATAR_SIZE, TIME_LOCALE, TIME_OPTIONS } from '@/presentation/config/livestream.config';

type Props = {
  livestream: Livestream;
  currentUserId?: string;
  onStartStream?: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
};

export const LivestreamCard: React.FC<Props> = ({ livestream, t, currentUserId, onStartStream }) => {
  const isLive = livestream.status === LivestreamStatus.LIVE;
  const isScheduled = livestream.status === LivestreamStatus.SCHEDULED;
  const isMyStream = currentUserId && livestream.hostId === currentUserId;
  const thumbnailUrl = livestream.thumbnail || PLACEHOLDER_THUMBNAIL;
  const hostAvatar = livestream.hostAvatar || PLACEHOLDER_AVATAR;

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
            width={LIVESTREAM_THUMBNAIL_WIDTH}
            height={LIVESTREAM_THUMBNAIL_HEIGHT}
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
              width={LIVESTREAM_AVATAR_SIZE}
              height={LIVESTREAM_AVATAR_SIZE}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-purple-100"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs sm:text-sm text-gray-800 truncate">{livestream.hostName}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                {isLive
                  ? t('live')
                  : livestream.startTime
                  ? `${t('scheduled')} ${new Date(livestream.startTime).toLocaleTimeString(TIME_LOCALE, TIME_OPTIONS)}`
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

          {isScheduled && isMyStream && onStartStream && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleStartStream}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                {t('start')}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default LivestreamCard;
