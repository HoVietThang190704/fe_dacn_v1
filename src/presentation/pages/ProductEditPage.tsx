'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ImageUploader from '@/components/ImageUploader';
import { Product, ProductCategory } from '@/domain/entities/Product';
import { UpdateProductPayload } from '@/domain/repositories/IProductRepository';
import { container } from '@/presentation/di/container';

interface ProductEditPageProps {
  productId: string;
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

const splitInput = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const toFormState = (product: Product): FormState => {
  const imageList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

  return {
    name: product.name ?? '',
    description: product.description ?? '',
    category: product.category?.id ?? '',
    price: String(product.price ?? ''),
    unit: product.unit ?? 'kg',
    images: imageList.join('\n'),
    stockQuantity: String(product.stockQuantity ?? product.stock ?? 0),
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
  };
};

export const ProductEditPage: React.FC<ProductEditPageProps> = ({ productId }) => {
  const t = useTranslations('productForm');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';

  const [formState, setFormState] = useState<FormState | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableCategories = useMemo(() => {
    if (categories.length === 0) return [] as (ProductCategory & { level?: number; order?: number })[];

    type RawCat = ProductCategory & { level?: number; order?: number; parentId?: string | null };
    const byId = new Map<string, RawCat>();
    categories.forEach((cat) => byId.set(cat.id, cat as RawCat));

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

    const unique = new Map<string, ProductCategory & { level?: number; order?: number }>();
    categories.forEach((cat) => {
      const raw = cat as RawCat;
      const depth = typeof raw.level === 'number' ? raw.level : computeDepth(raw.id);
      unique.set(raw.id, { ...raw, level: depth, order: raw.order });
    });

    return Array.from(unique.values());
  }, [categories]);

  useEffect(() => {
    let isMounted = true;

  const loadData = async () => {
      try {
        setIsLoading(true);
        const [productData, categoryData] = await Promise.all([
          container.getProductByIdUseCase.execute(productId),
          container.productRepository.getCategories(),
        ]);

        if (!isMounted) return;
        setFormState(toFormState(productData));
        setCategories(categoryData);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : t('loadError');
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [productId, t]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const buildPayload = (): UpdateProductPayload => {
    if (!formState) {
      throw new Error('Dữ liệu sản phẩm chưa được tải');
    }

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
      description: formState.description.trim(),
      category: formState.category,
      price,
      unit: formState.unit.trim(),
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
      const updatedProduct = await container.updateProductUseCase.execute(productId, payload);
      setSuccess(t('updateSuccess'));
      setTimeout(() => {
        router.push(`/${locale}/main/products/${updatedProduct.id}`);
      }, 1200);
    } catch (err) {
  const message = err instanceof Error ? err.message : t('updateError');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <button
            type="button"
            onClick={() => router.push(`/${locale}/main/products`)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            {t('backToList')}
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="mt-2 text-2xl font-semibold text-gray-800">{t('editTitle')}</h1>
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
                  <option value="">-- {t('category')} --</option>
                  {availableCategories.map((category) => {
                    const depth = (category as ProductCategory & { level?: number }).level ?? 0;
                    const indent = depth > 0 ? `${Array(depth).fill('- ').join('')}` : '';
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
                  placeholder="kg, piece, pack..."
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
                  className="border border-gray-200 rounded px-3 py-2"
                  placeholder="Mô tả ngắn gọn về sản phẩm..."
                />
              </label>
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="text-gray-700">{t('images')}</span>
                <div className="border border-gray-200 rounded px-3 py-2">
                  <ImageUploader
                    initialUrls={splitInput(formState.images)}
                    onChange={(urls) => setFormState((prev) => (prev ? { ...prev, images: urls.join('\n') } : prev))}
                  />
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
                  placeholder="fresh, organic"
                  className="border border-gray-200 rounded px-3 py-2"
                />
                <span className="text-xs text-gray-500">Nhập nhiều thẻ, phân tách bằng dấu phẩy hoặc xuống dòng.</span>
              </label>
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-60"
            >
              {isSubmitting ? t('updating') : t('update')}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/main/products`)}
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

export default ProductEditPage;
