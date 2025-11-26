'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { container } from '@/presentation/di/container';
import { splitInput } from '@/presentation/utils/string';
import { PRODUCT_FORM_CONFIG } from '@/presentation/config/productFormConfig';
import type { Product, ProductCategory } from '@/domain/entities/Product';
import type { UpdateProductPayload } from '@/domain/repositories/IProductRepository';

export interface FormState {
  name: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  images: string;
  stockQuantity: string;
  tags: string;
}

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
    unit: product.unit ?? PRODUCT_FORM_CONFIG.defaultUnit,
    images: imageList.join('\n'),
    stockQuantity: String(product.stockQuantity ?? product.stock ?? PRODUCT_FORM_CONFIG.defaultStockQuantity),
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
  };
};

export const useEditProduct = (productId: string) => {
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

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        const [productData, categoryData] = await Promise.all([
          container.getProductByIdUseCase.execute(productId),
          container.productRepository.getCategories(),
        ]);

        if (!mounted) return;
        setFormState(toFormState(productData));
        setCategories(categoryData);
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : t('loadError');
        setError(message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [productId, t]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const buildPayload = (): UpdateProductPayload => {
    if (!formState) {
      throw new Error(t('loadError'));
    }

    const price = Number(formState.price);
    const stockQuantity = Number(formState.stockQuantity);
    const tags = splitInput(formState.tags);

    if (!formState.name.trim()) {
      throw new Error(t('validation.nameRequired'));
    }
    if (!formState.category) {
      throw new Error(t('validation.categoryRequired'));
    }
    if (!formState.unit.trim()) {
      throw new Error(t('validation.unitRequired'));
    }
    if (Number.isNaN(price) || price <= PRODUCT_FORM_CONFIG.priceMin) {
      throw new Error(t('validation.invalidPrice'));
    }
    if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
      throw new Error(t('validation.invalidStock'));
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

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsSubmitting(true);
      const payload = buildPayload();
      const updatedProduct = await container.updateProductUseCase.execute(productId, payload);
      setSuccess(t('updateSuccess'));
      setTimeout(() => {
        router.push(`/${locale}/main/products/${updatedProduct.id}`);
      }, PRODUCT_FORM_CONFIG.routerPushDelayMs);
      return updatedProduct;
    } catch (err) {
      const message = err instanceof Error ? err.message : t('updateError');
      setError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return {
    formState,
    setFormState,
    categories: availableCategories,
    isLoading,
    isSubmitting,
    error,
    success,
    handleInputChange,
    handleSubmit,
  } as const;
};

export default useEditProduct;
