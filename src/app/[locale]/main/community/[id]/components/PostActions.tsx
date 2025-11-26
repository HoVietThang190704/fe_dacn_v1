'use client';

import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';

type Props = {
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  isLiked?: boolean;
  onLike: () => void;
};

export default function PostActions({ likesCount, commentsCount, sharesCount = 0, isLiked, onLike }: Props) {
  const t = useTranslations('community');

  return (
    <>
      <div className="px-4 py-3 border-y border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          {likesCount > 0 && (
            <>
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <Image src={ICONS.HEART} alt={t('likes') || 'likes'} width={12} height={12} />
              </div>
              <span>{likesCount.toLocaleString()}</span>
            </>
          )}
        </div>
        <div className="flex gap-4">
          <span>{commentsCount.toLocaleString()} {t('comments')}</span>
          {sharesCount > 0 && <span>{sharesCount.toLocaleString()} {t('shares')}</span>}
        </div>
      </div>

      <div className="px-2 py-2 flex gap-1 border-b border-gray-200">
        <button
          onClick={onLike}
          aria-label={t('like') || 'like'}
          className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 hover:bg-gray-100 ${
            isLiked ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          <Image src={isLiked ? ICONS.HEART_SELECT : ICONS.LIKE} alt={t('like') || 'like'} width={24} height={24} />
          <span>{t('like')}</span>
        </button>
      </div>
    </>
  );
}
