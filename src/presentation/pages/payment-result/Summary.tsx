"use client";

import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import React from 'react';

type Props = {
  iconSrc: string;
  title: string;
  description: string;
  statusLabel: string;
  styles: { bg: string; text: string; badge: string };
};

export const Summary: React.FC<Props> = ({ iconSrc, title, description, statusLabel, styles }) => {
  const src = iconSrc || ICONS.PLACEHOLDER;
  return (
    <div className={`flex flex-col items-center text-center gap-4`}> 
      <div className={`rounded-full p-2 ${styles.bg}`} aria-hidden="true">
        <div className={`w-12 h-12 relative ${styles.text}`}>
          <Image src={src} alt={title} width={48} height={48} className="object-contain" />
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${styles.badge}`}>
        {statusLabel}
      </span>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-700 max-w-xl">{description}</p>
    </div>
  );
};

export default Summary;
