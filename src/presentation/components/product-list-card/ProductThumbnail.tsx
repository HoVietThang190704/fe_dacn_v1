import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import type { Product } from '@/domain/entities/Product';

type Props = {
  product: Product;
  alt?: string;
};

export default function ProductThumbnail({ product, alt }: Props) {
  const thumbnail = product.image || product.images?.[0] || ICONS.PLACEHOLDER;

  return (
    <div className="relative aspect-square bg-gray-50">
      <Image
        src={String(thumbnail)}
        alt={alt ?? product.name ?? ''}
        width={400}
        height={400}
        className="w-full h-full object-cover"
        unoptimized
      />
    </div>
  );
}
