import React from 'react';
import PromotionCard from './PromotionCard';
import type { Promotion } from '@/domain/entities/Banner';
import { useTranslations } from 'next-intl';

type Props = {
  promotions: Promotion[];
};

export default function PromotionsSection({ promotions }: Props) {
  const t = useTranslations('home.sections.promotions');

  if (!Array.isArray(promotions) || promotions.length === 0) {
    return null;
  }

  return (
    <section aria-label={String(t('title'))} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {promotions.map((promo) => (
        <PromotionCard key={promo.id} promotion={promo} />
      ))}
    </section>
  );
}
