'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';

type Props = {
  userName?: string;
  onBack: () => void;
};

export default function PostHeader({ userName, onBack }: Props) {
  const t = useTranslations('community');

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label={t('back') || 'Back'}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Image src={ICONS.ARROW_LEFT} alt={t('icons.closeAlt') || 'back'} width={24} height={24} />
        </button>
        <h1 className="text-lg font-semibold">{t('postOfUser', { userName: userName || t('userFallback') })}</h1>
      </div>
    </div>
  );
}
