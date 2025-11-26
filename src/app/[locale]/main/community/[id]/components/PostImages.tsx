'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

type Props = {
  images?: string[];
};

export default function PostImages({ images }: Props) {
  const t = useTranslations('postEditor');
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="mb-4">
        <Image
          src={images[0]}
          alt={t('imageAlt', { index: 1 })}
          width={800}
          height={600}
          className="w-full object-contain max-h-[600px]"
        />
      </div>
    );
  }

  const gridCols = images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className={`grid gap-1 ${gridCols} mb-4`}>
          {images.map((image, index) => (
        <Image
          key={index}
          src={image}
          alt={t('imageAlt', { index: index + 1 })}
          width={400}
          height={300}
          className="w-full h-64 object-cover"
        />
      ))}
    </div>
  );
}
