import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';

export const Tips: React.FC = () => {
  const t = useTranslations('livestream');

  return (
    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <Image src={ICONS.QUESTION} alt={t('tips.title')} width={18} height={18} />
        {t('tips.title')}
      </h3>
      <ul className="space-y-2 text-sm text-blue-800">
        <li className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
          <span>{t('tips.tip1')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
          <span>{t('tips.tip2')}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
          <span>{t('tips.tip3')}</span>
        </li>
      </ul>
    </div>
  );
};
