import Image from 'next/image';
import React from 'react';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';
import type { Promotion } from '@/domain/entities/Banner';

type Props = {
  promotion: Promotion;
};

export default function PromotionCard({ promotion }: Props) {
  const t = useTranslations('home.sections.promotions');

  const imageSrc = promotion.image || ICONS.THUNDER || ICONS.PLACEHOLDER;

  if (!imageSrc) console.error(`Promotion ${promotion.id} is missing an image and there is no ICONS fallback.`);

  return (
    <article
      key={promotion.id}
      className="p-4 rounded-lg text-white flex items-center gap-4"
      style={{ backgroundColor: promotion.backgroundColor }}
      aria-labelledby={`promo-${promotion.id}-title`}
    >
      <div className="w-14 h-14 flex-shrink-0 relative">
        <Image
          src={String(imageSrc)}
          alt={promotion.title ?? String(t('title'))}
          width={56}
          height={56}
          className="object-contain rounded"
          unoptimized
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 id={`promo-${promotion.id}-title`} className="text-lg font-semibold leading-tight">
          {promotion.title}
        </h3>
        <p className="text-sm opacity-90 truncate">{promotion.description}</p>
      </div>

      <div className="text-right flex-shrink-0 ml-2">
        <div className="text-2xl font-bold">{t('saveDiscount', { discount: promotion.discount })}</div>
        <div className="text-xs opacity-80 mt-0.5">
          {t('validUntil', { date: new Date(promotion.validTo).toLocaleDateString() })}
        </div>
      </div>
    </article>
  );
}
