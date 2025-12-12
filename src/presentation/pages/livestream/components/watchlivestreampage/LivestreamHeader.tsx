import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { Livestream } from '@/domain/entities/Livestream';
import { useTranslations } from 'next-intl';

interface Props {
  livestream: Livestream;
  viewerCount: number;
  hostAvatar?: string | null;
  onLeave: () => void;
  onOpenProducts?: () => void;
  hasProducts?: boolean;
}

export const LivestreamHeader: React.FC<Props> = ({ livestream, viewerCount, hostAvatar, onLeave, onOpenProducts, hasProducts }) => {
  const t = useTranslations('livestream');
  const avatarSrc = hostAvatar || ICONS.PLACEHOLDER;

  if (!ICONS.USERS) throw new Error('Missing icon: ICONS.USERS');
  if (!ICONS.ARROW_LEFT) throw new Error('Missing icon: ICONS.ARROW_LEFT');
  if (!ICONS.GOODS) throw new Error('Missing icon: ICONS.GOODS');

  return (
    <div className="bg-gray-800 border-b border-gray-700 lg:rounded-t-xl -mt-4 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between mb-3 -mt-1">
        <div className="flex items-center gap-3 -ml-6">
          <Image
            src={avatarSrc}
            alt={livestream.hostName}
            width={48}
            height={48}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-purple-500"
            unoptimized
          />
          <div>
            <p className="font-semibold text-base sm:text-lg">{livestream.hostName}</p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <Image src={ICONS.USERS} alt={t('viewersAlt')} width={16} height={16} className="w-4 h-4" unoptimized />
              <span className="font-semibold">{viewerCount}</span>
              <span>{t('viewers')}</span>
            </div>
          </div>
        </div>

        {hasProducts && onOpenProducts ? (
          <button
            type="button"
            onClick={onOpenProducts}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-300 hover:bg-green-400 text-sm font-semibold text-black"
          >
            <Image src={ICONS.GOODS} alt={t('productsAlt')} width={18} height={18} className="w-4 h-4" unoptimized />
            <span className="hidden sm:inline">{t('watch.products')}</span>
            <span className="sm:hidden">{t('watch.products')}</span>
          </button>
        ) : null}
      </div>

      <h2 className="text-lg sm:text-xl font-bold mb-2">{livestream.title}</h2>
      {livestream.description && (
        <p className="text-sm text-gray-300 line-clamp-2">{livestream.description}</p>
      )}
    </div>
  );
};

export default LivestreamHeader;
