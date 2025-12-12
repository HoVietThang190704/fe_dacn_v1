import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { LivestreamStatus } from '@/domain/entities/Livestream';
import { useTranslations, useLocale } from 'next-intl';

interface Props {
  status: LivestreamStatus;
  startTime?: string | Date | null;
}

export const LivestreamPlaceholder: React.FC<Props> = ({ status, startTime }) => {
  const t = useTranslations('livestream');
  const locale = useLocale();

  if (!ICONS.CALENDAR) throw new Error('Missing icon: ICONS.CALENDAR');
  if (!ICONS.VIDEO_CAMERA_ALT) throw new Error('Missing icon: ICONS.VIDEO_CAMERA_ALT');
  if (!ICONS.PLAY) throw new Error('Missing icon: ICONS.PLAY');

  if (status === LivestreamStatus.SCHEDULED) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
        <div className="text-center px-4">
          <Image src={ICONS.CALENDAR} alt={t('watch.scheduled')} width={64} height={64} unoptimized />
          <p className="text-lg sm:text-xl mb-2">{t('watch.scheduled')}</p>
          {startTime && <p className="text-sm sm:text-base text-gray-400">{t('watch.startTime')}: {new Date(String(startTime)).toLocaleString(locale)}</p>}
        </div>
      </div>
    );
  }

  if (status === LivestreamStatus.ENDED) {
    return (
      <div className="absolute inset-0 flex text-center items-center justify-center bg-gray-800">
        <div className="text-center px-4">
          <Image src={ICONS.VIDEO_CAMERA_ALT} alt={t('watch.ended')} width={64} height={64} unoptimized  className=" mx-auto"/>
          <p className="text-lg sm:text-xl mb-2">{t('watch.ended')}</p>
          <p className="text-sm sm:text-base text-gray-400">{t('watch.thankYou')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
      <div className="text-center px-4">
        <p className="text-lg sm:text-xl">{t('watch.connecting')}</p>
      </div>
    </div>
  );
};

export default LivestreamPlaceholder;
