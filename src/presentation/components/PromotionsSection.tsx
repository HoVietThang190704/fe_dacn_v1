import React from 'react';
import { Promotion } from '@/domain/entities/Banner';

const PromotionsSection: React.FC<{ promotions: Promotion[] }> = ({ promotions }) => {
  if (!promotions.length) return null;

  return (
    <section className="grid grid-cols-4 gap-4 mb-8">
      {promotions.map((promo) => (
        <div
          key={promo.id}
          className="p-4 rounded-lg text-white"
          style={{ backgroundColor: promo.backgroundColor }}
        >
          <div className="text-2xl font-bold mb-1">
            Save {promo.discount}%
          </div>
          <div className="text-sm">{promo.description}</div>
        </div>
      ))}
    </section>
  );
};

export default PromotionsSection;