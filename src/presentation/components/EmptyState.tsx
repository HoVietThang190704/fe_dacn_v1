import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';

const EmptyState: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="text-center py-12 bg-white rounded-lg">
    <div className="mx-auto mb-4 w-fit">
      <Image
        src={ICONS.HEART}
        alt={String(t('emptyTitle'))}
        width={56}
        height={56}
        className="text-gray-400"
      />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('emptyTitle')}</h3>
    <p className="text-gray-500 mb-6">
      {t('emptyDesc')}
    </p>
    <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
      {t('discover')}
    </button>
  </div>
);

export default EmptyState;