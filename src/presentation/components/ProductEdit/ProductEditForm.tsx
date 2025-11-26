"use client";

import React from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/ImageUploader';
import { useTranslations } from 'next-intl';
import { PRODUCT_FORM_CONFIG } from '@/presentation/config/productFormConfig';
import { splitInput } from '@/presentation/utils/string';
import { ICONS } from '@/shared/constants/images';


import type { ProductCategory, Product } from '@/domain/entities/Product';
import type { FormState as EditFormState } from '@/presentation/hooks/useEditProduct';

type CategoryWithLevel = ProductCategory & { level?: number; order?: number };

interface Props {
  formState: EditFormState;
  setFormState: React.Dispatch<React.SetStateAction<EditFormState | null>>;
  categories: CategoryWithLevel[];
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<Product | null> | void;
  onCancel?: () => void;
}

const buildIndent = (depth: number) => {
  if (depth <= 0) return '';
  return '\u00A0'.repeat(depth * PRODUCT_FORM_CONFIG.categoryIndentSpaces);
};

const ProductEditForm: React.FC<Props> = ({
  formState,
  setFormState,
  categories,
  isSubmitting,
  error,
  success,
  handleInputChange,
  handleSubmit,
  onCancel,
}) => {
  const t = useTranslations('productForm');

  if (!formState) return null;

  const getIcon = (k: keyof typeof ICONS) => {
    const v = ICONS[k];
    if (!v) throw new Error(`Icon not found: ${k}`);
    return v;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-6 space-y-6">
        <div>
          <button type="button" onClick={onCancel} className="text-sm text-orange-500 hover:underline">
            {t('backToList')}
          </button>
          <h1 className="mt-2 text-2xl font-semibold text-gray-800 flex items-center gap-3">
            <div className="inline-block w-5 h-5 relative">
              <Image src={getIcon('EDIT')} alt={t('editTitle')} sizes="20px" fill style={{ objectFit: 'contain' }} />
            </div>
            {t('editTitle')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">{t('editDescription')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section>
            <h2 className="text-lg font-medium text-gray-800 mb-4">{t('basicInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-700">{t('name')}</span>
                <input name="name" value={formState.name} onChange={handleInputChange} required className="border border-gray-200 rounded px-3 py-2" />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-700">{t('category')}</span>
                <select name="category" value={formState.category} onChange={handleInputChange} required className="border border-gray-200 rounded px-3 py-2">
                  <option value="">{t('chooseCategoryPlaceholder')}</option>
                  {categories.map((category: CategoryWithLevel) => {
                    const depth = category.level ?? 0;
                    return (
                      <option key={category.id} value={category.id}>
                        {buildIndent(depth)}{category.name}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-700">{t('unit')}</span>
                <input name="unit" value={formState.unit} onChange={handleInputChange} required placeholder={t('unitPlaceholder')} className="border border-gray-200 rounded px-3 py-2" />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-700">{t('price')}</span>
                <input type="number" min={0} step={PRODUCT_FORM_CONFIG.priceStep} name="price" value={formState.price} onChange={handleInputChange} required className="border border-gray-200 rounded px-3 py-2" />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-gray-700">{t('descriptionLabel')}</span>
                <textarea name="description" value={formState.description} onChange={handleInputChange} rows={3} placeholder={t('descriptionPlaceholder')} className="border border-gray-200 rounded px-3 py-2" />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-gray-700">{t('images')}</span>
                <div className="border border-gray-200 rounded px-3 py-2">
                  <ImageUploader initialUrls={splitInput(formState.images)} onChange={(urls) => setFormState((prev) => (prev ? { ...prev, images: urls.join('\n') } : prev))} />
                  <p className="text-xs text-gray-500 mt-2">{t('imagesInfo')}</p>
                </div>
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-800 mb-4">{t('inventory')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-700">{t('stockQuantity')}</span>
                <input type="number" name="stockQuantity" min={0} value={formState.stockQuantity} onChange={handleInputChange} required className="border border-gray-200 rounded px-3 py-2" />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-gray-700">{t('tags')}</span>
                <input name="tags" value={formState.tags} onChange={handleInputChange} placeholder={t('tagsPlaceholder')} className="border border-gray-200 rounded px-3 py-2" />
                <span className="text-xs text-gray-500">{t('tagsInfo')}</span>
              </label>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-60">
              {isSubmitting ? t('updating') : t('update')}
            </button>
            <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50">
              {t('backToList')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditForm;
