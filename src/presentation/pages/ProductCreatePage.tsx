'use client';

import React, { useMemo, useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProductCategory } from '@/domain/entities/Product';
import { container } from '@/presentation/di/container';
import { CreateProductPayload } from '@/domain/repositories/IProductRepository';

interface ProductCreatePageProps {
  categories: ProductCategory[];
}

interface FormState {
  name: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  images: string;
  stockQuantity: string;
  tags: string;
}

const defaultState: FormState = {
  name: '',
  description: '',
  category: '',
  price: '',
  unit: 'kg',
  images: '',
  stockQuantity: '1',
  tags: '',
};

const splitInput = (value: string): string[] =>
  value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const ProductCreatePage: React.FC<ProductCreatePageProps> = ({ categories }) => {
  const t = useTranslations('productForm');
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const availableCategories = useMemo(() => {
    if (categories.length === 0) return [] as ProductCategory[];

    type RawCat = ProductCategory & { level?: number; order?: number };

    const byId = new Map<string, RawCat>();
    categories.forEach((c) => byId.set(c.id, c));
    const depthMap = new Map<string, number>();
    const computeDepth = (id?: string | null): number => {
      if (!id) return 0;
      if (depthMap.has(id)) return depthMap.get(id)!;
      const cat = byId.get(id);
      if (!cat) return 0;
      const depth = 1 + computeDepth(cat.parentId ?? null);
      depthMap.set(id, depth);
      return depth;
    };

    const unique = new Map<string, ProductCategory & { depth?: number; order?: number }>();
    categories.forEach((cat) => {
      // prefer canonical `level` from backend when available, otherwise compute
      const raw = cat as unknown as RawCat;
      const d = typeof raw.level === 'number' ? raw.level : computeDepth(raw.id);
      unique.set(raw.id, { ...raw, depth: d, order: raw.order });
    });

    return Array.from(unique.values()).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      slug: c.slug,
      parentId: c.parentId,
      // expose level/order for rendering
      level: c.depth ?? 0,
      order: c.order,
    } as ProductCategory & { level?: number; order?: number }));
  }, [categories]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    if (type === 'checkbox') {
      setFormState((prev) => ({
        ...prev,
        [name]: (event.target as HTMLInputElement).checked,
      }));
      return;
    }

    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildPayload = (): CreateProductPayload => {
    const price = Number(formState.price);
    const stockQuantity = Number(formState.stockQuantity);
    const tags = splitInput(formState.tags);

    if (!formState.name.trim()) {
      throw new Error('Tên sản phẩm không được để trống');
    }
    if (!formState.category) {
      throw new Error('Vui lòng chọn danh mục');
    }
    if (!formState.unit.trim()) {
      throw new Error('Vui lòng nhập đơn vị');
    }
    if (Number.isNaN(price) || price <= 0) {
      throw new Error('Giá phải lớn hơn 0');
    }
    if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
      throw new Error('Số lượng không hợp lệ');
    }

    return {
      name: formState.name.trim(),
      category: formState.category,
      price,
      unit: formState.unit.trim(),
      description: formState.description.trim() || `Sản phẩm ${formState.name}`,
      images: splitInput(formState.images),
      stockQuantity,
      tags,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      setIsSubmitting(true);
      const payload = buildPayload();
      const product = await container.createProductUseCase.execute(payload);
      console.log('Product created:', product);
      setSuccess(t('success'));
      setFormState(defaultState);
      setTimeout(() => {
        router.push(`/main/products/${product.id}`);
      }, 1500);
    } catch (err) {
      console.error('Create product error:', err);
      if (err instanceof Error) {
        setError(err.message);  
      } else {
        setError(t('error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-6 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-orange-500 hover:underline"
          >
            {t('backToList')}
          </button>
          <h1 className="mt-2 text-2xl font-semibold text-gray-800">{t('title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('description')}</p>
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
                <input
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-200 rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-700">{t('category')}</span>
                <select
                  name="category"
                  value={formState.category}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-200 rounded px-3 py-2"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {availableCategories.map((category) => {
                    const depth = (category as ProductCategory & { level?: number }).level ?? 0;
                    const indent = depth > 0 ? `${'\u00A0'.repeat(depth * 2)} ` : '';
                    return (
                      <option key={category.id} value={category.id}>
                        {indent}{category.name}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-700">{t('unit')}</span>
                <input
                  name="unit"
                  value={formState.unit}
                  onChange={handleInputChange}
                  required
                  placeholder="kg, cái, bó..."
                  className="border border-gray-200 rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-700">{t('price')}</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  name="price"
                  value={formState.price}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-200 rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-gray-700">{t('descriptionLabel')}</span>
                <textarea
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về sản phẩm..."
                  className="border border-gray-200 rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-gray-700">{t('images')}</span>
                <div className="border border-gray-200 rounded px-3 py-2">
                  <ImageUploader
                    initialUrls={splitInput(formState.images)}
                    onChange={(urls) => setFormState((prev) => ({ ...prev, images: urls.join('\n') }))}
                  />
                  <p className="text-xs text-gray-500 mt-2">Hệ thống upload ảnh lên Cloudinary; mỗi ảnh sẽ lưu đường dẫn và gửi cùng payload.</p>
                </div>
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-800 mb-4">{t('inventory')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-gray-700">{t('stockQuantity')}</span>
                <input
                  type="number"
                  name="stockQuantity"
                  min="0"
                  value={formState.stockQuantity}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-200 rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-gray-700">{t('tags')}</span>
                <input
                  name="tags"
                  value={formState.tags}
                  onChange={handleInputChange}
                  placeholder="tươi, sạch, hữu cơ"
                  className="border border-gray-200 rounded px-3 py-2"
                />
                <span className="text-xs text-gray-500">Nhập nhiều thẻ và phân tách bằng dấu phẩy hoặc xuống dòng.</span>
              </label>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-60"
            >
              {isSubmitting ? t('creating') : t('submit')}
            </button>
            <button
              type="button"
              onClick={() => router.push('/main/products')}
              className="px-6 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('backToList')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreatePage;
