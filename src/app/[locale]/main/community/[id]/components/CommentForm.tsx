'use client';

import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';

type Props = {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  avatar?: string | null;
};

export default function CommentForm({ value, onChange, onSubmit, disabled, avatar }: Props) {
  const t = useTranslations('community');

  return (
    <form onSubmit={onSubmit} className="p-4 border-b border-gray-200 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden bg-gray-200">
        {avatar ? (
          <Image src={avatar} alt={t('userFallback')} width={40} height={40} className="object-cover" />
        ) : (
          <Image src={ICONS.PLACEHOLDER} alt={t('userFallback')} width={40} height={40} />
        )}
      </div>
      <div className="flex-1 flex gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('commentPlaceholder') || 'Write a comment...'}
          className="flex-1 px-4 py-2 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-10 overflow-hidden"
          disabled={disabled}
          aria-label={t('commentPlaceholder')}
          rows={1}
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="px-6 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {disabled ? (t('sending') || '...') : (t('send') || 'Send')}
        </button>
      </div>
    </form>
  );
}
