import React from 'react';
import type { Product } from '@/domain/entities/Product';
import ProductListCard from '@/presentation/components/ProductListCard';
import { useTranslations } from 'next-intl';

interface ProductSectionProps {
  products: Product[];
  hasMore: boolean;
  onLoadMore: () => void;
  total: number;
  router?: { push: (path: string) => void };
  isLoadingMore?: boolean;
}

const ProductsSection: React.FC<ProductSectionProps> = ({ products, hasMore, onLoadMore, total, router, isLoadingMore = false }) => {
  const t = useTranslations('search');

  return (
    <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{t('results.products', { count: total })}</h2>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500 ">{t('results.noProductsDesc')}</p>
      ) : (
        <div className="grid grid-cols-2 -mx-2 gap-1 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductListCard key={product.id} product={product} router={router} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className={`px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 border rounded ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t('results.loadMore')}
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductsSection;
