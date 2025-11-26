"use client";

import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';

interface ChatHeaderProps {
  viewerCount: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ viewerCount }) => {
  const t = useTranslations('livestream');
  const chatIcon = ICONS.CHAT ?? ICONS.PLACEHOLDER;
  const viewersIcon = ICONS.USERS ?? ICONS.PLACEHOLDER;

  return (
    <div className="px-4 py-3 border-b border-gray-700">
      <div className="flex items-center justify-between">
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
