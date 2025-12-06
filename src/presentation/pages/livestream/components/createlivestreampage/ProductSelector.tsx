import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { Product } from '@/domain/entities/Product';
import { useTranslations } from 'next-intl';

type Props = {
  availableProducts: Product[];
  isLoadingProducts: boolean;
  productSearch: string;
  setProductSearch: (value: string) => void;
  formProducts: string[];
  onToggleProduct: (productId: string) => void;
  priceFormatter: Intl.NumberFormat;
  productError?: string;
};

export const ProductSelector: React.FC<Props> = ({
  availableProducts,
  isLoadingProducts,
  productSearch,
  setProductSearch,
  formProducts,
  onToggleProduct,
  priceFormatter,
  productError
}) => {
  const t = useTranslations('livestream');

  const filteredProducts = React.useMemo(() => {
    if (!productSearch.trim()) return availableProducts;
    const keyword = productSearch.trim().toLowerCase();
    return availableProducts.filter((product) => product.name.toLowerCase().includes(keyword));
  }, [availableProducts, productSearch]);

  return (
    <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/40">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{t('form.productsLabel')}</p>
          <p className="text-xs text-gray-600">{t('form.productsHelper')}</p>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {t('form.productsCounter', { count: formProducts.length, total: availableProducts.length })}
        </span>
      </div>

      {isLoadingProducts ? (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>{t('form.productsLoading')}</span>
        </div>
      ) : availableProducts.length === 0 ? (
        <div className="text-sm text-gray-600 bg-white rounded-lg p-4 border border-dashed border-gray-200">
          <p>{t('form.productsEmpty')}</p>
          <button
            type="button"
            onClick={() => window.location.assign('/main/products/create')}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
          >
            <Image src={ICONS.PLUS} alt={t('form.createProductCta')} width={16} height={16} />
            <span>{t('form.createProductCta')}</span>
          </button>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={t('form.productSearchPlaceholder')}
                className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Image src={ICONS.SEARCH} alt={t('form.productSearchPlaceholder')} width={18} height={18} />
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
            {filteredProducts.map((product) => {
              const isSelected = formProducts.includes(product.id);
              return (
                <label
                  key={product.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                    isSelected ? 'border-purple-500 bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <input type="checkbox" checked={isSelected} onChange={() => onToggleProduct(product.id)} className="sr-only" />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-while border-purple-600' : 'border-gray-400'}`}>
                    {isSelected && (
                      <Image src={ICONS.CHECK} alt={t('form.productsLabel')} width={12} height={12} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 truncate">{priceFormatter.format(product.price)} · {product.unit}</p>
                  </div>
                  <span className="text-[11px] text-gray-400">#{product.id.slice(-4)}</span>
                </label>
              );
            })}
            {filteredProducts.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">{t('form.productsSearchEmpty')}</p>
            )}
          </div>

          {formProducts.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {formProducts.map((id) => {
                const product = availableProducts.find((item) => item.id === id);
                return (
                  <span key={id} className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center gap-2">
                    <span className="truncate max-w-[140px]">{product?.name || id}</span>
                    <button
                      type="button"
                      onClick={() => onToggleProduct(id)}
                      className="text-purple-500 hover:text-purple-700"
                      aria-label={t('form.removeProduct')}
                    >
                      <Image src={ICONS.CROSS} alt={t('form.removeProduct')} width={12} height={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {productError && <p className="text-sm text-red-500 mt-2">{productError}</p>}
          {!isLoadingProducts && availableProducts.length > 0 && formProducts.length === 0 && (
            <p className="text-sm text-red-500 mt-2">{t('form.productsRequired')}</p>
          )}
        </>
      )}
    </div>
  );
};
