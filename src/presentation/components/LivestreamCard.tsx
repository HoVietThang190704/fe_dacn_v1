import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';
import { LIVESTREAM_THUMBNAIL_WIDTH, LIVESTREAM_THUMBNAIL_HEIGHT, PLACEHOLDER_THUMBNAIL, PLACEHOLDER_AVATAR, LIVESTREAM_AVATAR_SIZE, TIME_LOCALE, TIME_OPTIONS } from '@/presentation/config/livestream.config';
import { ICONS } from '@/shared/constants/images';

type Props = {
  livestream: Livestream;
  currentUserId?: string;
  onStartStream?: (id: string) => void;
  t?: ReturnType<typeof useTranslations>;
};

export const LivestreamCard: React.FC<Props> = ({ livestream, t, currentUserId, onStartStream }) => {
  const isLive = livestream.status === LivestreamStatus.LIVE;
  const isScheduled = livestream.status === LivestreamStatus.SCHEDULED;
  const isMyStream = currentUserId && livestream.hostId === currentUserId;
  const thumbnailUrl = livestream.thumbnail || PLACEHOLDER_THUMBNAIL;
  const hostAvatar = livestream.hostAvatar || PLACEHOLDER_AVATAR;
  const localT = useTranslations('livestream');
  const translate = t ?? localT;

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
            <div className="absolute top-4 left-4 inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse shadow-md">
              <span className="w-2 h-2 rounded-full bg-white block" aria-hidden />
              <span>{translate('liveBadge')}</span>
            </div>
          ) : (
            <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-400 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
              {ICONS?.CALENDAR ? (
                <Image src={ICONS.CALENDAR} alt={translate('upcomingBadge')} width={16} height={16} className="w-3.5 h-3.5 object-contain" />
              ) : null}
              <span>{translate('upcomingBadge')}</span>
            </div>
          )}

          {isLive && (
            <div className="absolute top-4 right-4 bg-white/95 text-gray-800 px-3 py-2 rounded-full text-xs font-medium shadow-sm flex items-center gap-2 border border-gray-100">
              {ICONS?.EYE_OPEN ? (
                <Image
                  src={ICONS.EYE_OPEN}
                  alt={translate('viewersAlt')}
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
              ) : (
                (() => {
                  console.error('Missing ICONS.EYE_OPEN - please add icon at src/shared/constants/images.ts');
                  return null;
                })()
              )}

              <span className="whitespace-nowrap">
                {livestream.viewerCount?.toLocaleString() ?? 0} {livestream.viewerCount === 1 ? translate('viewer') : translate('viewers')}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
              {ICONS?.PLAY ? (
                <Image
                  src={ICONS.PLAY}
                  alt={translate('playAlt')}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain text-purple-600"
                />
              ) : (
                (() => {
                  console.error('Missing ICONS.PLAY - please add icon at src/shared/constants/images.ts');
                  return null;
                })()
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-3">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 line-clamp-2 text-gray-800 group-hover:text-purple-600 transition-colors">
            {livestream.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2 leading-relaxed -mt-3">
            {livestream.description}
          </p>

          <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
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
                  ? translate('live')
                  : livestream.startTime
                  ? `${translate('scheduled')} ${new Date(livestream.startTime).toLocaleTimeString(TIME_LOCALE, TIME_OPTIONS)}`
                  : translate('scheduled')}
              </div>
            </div>
          </div>

          {livestream.products.length > 0 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-600 font-medium">
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-100 rounded-full flex items-center justify-center">
                {ICONS?.SHOPPING_CART ? (
                  <Image src={ICONS.SHOPPING_CART} alt={translate('productsAlt')} width={16} height={16} className="w-3 h-3 sm:w-4 sm:h-4 object-contain" />
                ) : (
                  (() => {
                    console.error('Missing ICONS.SHOPPING_CART - please add icon at src/shared/constants/images.ts');
                    return null;
                  })()
                )}
              </div>
              <span className="font-medium">{livestream.products.length} {translate('products')}</span>
            </div>
          )}

          {isScheduled && isMyStream && onStartStream && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleStartStream}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition flex items-center justify-center gap-2"
              >
                {ICONS?.VIDEO_CAMERA_ALT ? (
                  <Image src={ICONS.VIDEO_CAMERA_ALT} alt={translate('startAlt')} width={20} height={20} className="w-5 h-5 object-contain" />
                ) : (
                  (() => {
                    console.error('Missing ICONS.VIDEO_CAMERA_ALT - please add icon at src/shared/constants/images.ts');
                    return null;
                  })()
                )}
                {translate('start')}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default LivestreamCard;
