'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { container } from '@/presentation/di/container';
import { CreateProductPayload } from '@/domain/repositories/IProductRepository';
import { splitInput } from '@/presentation/utils/string';
import { PRODUCT_FORM_CONFIG } from '@/presentation/config/productFormConfig';

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

export const defaultState: FormState = {
  name: '',
  description: '',
  category: '',
  price: '',
  unit: PRODUCT_FORM_CONFIG.defaultUnit,
  images: '',
  stockQuantity: String(PRODUCT_FORM_CONFIG.defaultStockQuantity),
  tags: '',
};

export const useProductForm = (initialFormState?: Partial<FormState>) => {
  const router = useRouter();
  const t = useTranslations('productForm');

  const [formState, setFormState] = useState<FormState>({
    ...defaultState,
    ...initialFormState,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => setFormState({ ...defaultState });

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = event.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormState((prev) => ({
        ...prev,
        [name]: (event.target as HTMLInputElement).checked,
      } as unknown as FormState));
      return;
    }

    setFormState((prev) => ({ ...prev, [name]: value } as FormState));
  };

  const buildPayload = (): CreateProductPayload => {
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
      category: formState.category,
      price,
      unit: formState.unit.trim(),
      description: formState.description.trim() || `${t('defaultDescription')} ${formState.name}`,
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
      const product = await container.createProductUseCase.execute(payload);
      setSuccess(t('success'));
      reset();
      setTimeout(() => {
        router.push(`/main/products/${product.id}`);
      }, PRODUCT_FORM_CONFIG.routerPushDelayMs);
      return product;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('error'));
      }
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    setFormState,
    handleInputChange,
    isSubmitting,
    error,
    success,
    handleSubmit,
    reset,
  } as const;
};
