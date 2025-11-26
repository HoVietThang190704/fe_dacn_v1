import React from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  active: 'posts' | 'products';
  postsCount: number;
  productsCount: number;
  onChange: (v: 'posts' | 'products') => void;
};

const Tabs: React.FC<Props> = ({ active, postsCount, productsCount, onChange }) => {
  const t = useTranslations('profile');

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-8">
          <button
            onClick={() => onChange('posts')}
            className={`py-4 px-2 font-medium text-sm relative ${
              active === 'posts'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('tabs.posts', { count: postsCount })}
          </button>

          <button
            onClick={() => onChange('products')}
            className={`py-4 px-2 font-medium text-sm relative ${
              active === 'products'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('tabs.products', { count: productsCount })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
