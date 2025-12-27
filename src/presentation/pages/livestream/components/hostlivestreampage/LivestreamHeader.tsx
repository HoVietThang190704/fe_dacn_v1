import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ICONS } from '@/shared/constants/images';
import Icon from './Icon';

interface Props {
  title?: string;
  hostAvatar?: string | null;
  hostName?: string;
  isStreaming?: boolean;
  viewerCount?: number;
  overlay?: boolean;
}

export const LivestreamHeader: React.FC<Props> = ({ title, hostAvatar, hostName, isStreaming, viewerCount, overlay }) => {
  const t = useTranslations('livestream');

  const outerClass = overlay ? 'absolute left-0 right-0 top-4 z-30 pointer-events-auto' : ' backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-10';
  const innerClass = overlay ? 'max-w-[1200px] mx-auto px-4 sm:px-6 py-2 sm:py-3' : 'max-w-[1800px] mx-auto px-4 sm:px-6 py-3 sm:py-4';

  return (
    <div className={outerClass}>
      <div className={innerClass}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">


            {hostAvatar && (
              <div className="hidden sm:flex items-center mr-3">
                <Image src={hostAvatar} alt={hostName || ''} width={40} height={40} className="rounded-full object-cover" unoptimized />
              </div>
            )}
            <h1 className="text-lg sm:text-xl font-bold truncate">{title}</h1>
            {isStreaming && (
              <span className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full" aria-hidden />
                {t('host.live')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-black bg-white/50 px-3 py-1.5 rounded-full">
              <Icon name={('EYES' as const)} alt={t('viewersAlt') as string} width={20} height={20} className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              <span className="font-semibold text-sm sm:text-base">{viewerCount}</span>
              <span className="text-xs sm:text-sm hidden sm:inline">{t('host.viewers')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivestreamHeader;
