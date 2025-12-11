"use client";

import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';

interface ChatHeaderProps {
  viewerCount: number;
  hideOnMobile?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ viewerCount, hideOnMobile }) => {
  const t = useTranslations('livestream');
  const chatIcon = ICONS.CHAT ?? ICONS.PLACEHOLDER;
  const viewersIcon = ICONS.USERS ?? ICONS.PLACEHOLDER;

  const rootClass = `${hideOnMobile ? 'hidden sm:flex' : 'flex'} items-center justify-between px-4 py-3 border-b border-gray-700`;

  return (
    <div className={rootClass}>
      <div className="w-full">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Image src={chatIcon} alt={t('chatBox.title')} width={20} height={20} unoptimized />
          <span>{t('chatBox.title')}</span>
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Image src={viewersIcon} alt={t('watch.viewersAlt')} width={16} height={16} unoptimized />
          <span className="font-semibold">{viewerCount}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
