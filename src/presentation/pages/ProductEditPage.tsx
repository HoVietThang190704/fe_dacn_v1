"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import useEditProduct from '@/presentation/hooks/useEditProduct';
import ProductEditForm from '@/presentation/components/ProductEdit/ProductEditForm';

interface ProductEditPageProps {
  productId: string;
}

export const ProductEditPage: React.FC<ProductEditPageProps> = ({ productId }) => {
  const t = useTranslations('productForm');
  const router = useRouter();

  const {
    formState,
    setFormState,
    categories,
    isLoading,
    isSubmitting,
    error,
    success,
    handleInputChange,
    handleSubmit,
  } = useEditProduct(productId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!formState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-sm text-center space-y-3">
          <h1 className="text-xl font-semibold text-gray-800">{t('editTitle')}</h1>
          <p className="text-sm text-gray-600">{error || t('loadError')}</p>
          <button type="button" onClick={() => router.push('/main/products')} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
            {t('backToList')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductEditForm
      formState={formState}
      setFormState={setFormState}
      categories={categories}
      isSubmitting={isSubmitting}
      error={error}
      success={success}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      onCancel={() => router.push('/main/products')}
    />
  );
};

export default ProductEditPage;
