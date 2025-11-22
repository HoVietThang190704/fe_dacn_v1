import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';

type Props = { message: string; t: ReturnType<typeof useTranslations> };

export const LivestreamsEmptyState: React.FC<Props> = ({ message, t }) => (
  <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-lg max-w-2xl mx-auto px-4 sm:px-6">
    <div className="mb-4 sm:mb-6 animate-bounce flex justify-center">
      <Image
        src={ICONS.VIDEO_CAMERA_ALT}
        alt="livestream"
        width={96}
        height={96}
        className="w-16 h-16 sm:w-24 sm:h-24"
      />
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{message}</h3>
    <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8">{t('pleaseComeBack')}</p>
  </div>
);

export default LivestreamsEmptyState;
