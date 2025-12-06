'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/shared/hooks/useAuth';
import { container } from '@/presentation/di/container';
import { CreateLivestreamDto } from '@/domain/entities/Livestream';
import { Product } from '@/domain/entities/Product';
import { LivestreamForm } from './types';
import { ICONS } from '@/shared/constants/images';
import { HostInfo } from './components/createlivestreampage/HostInfo';
import { ProductSelector } from './components/createlivestreampage/ProductSelector';
import { ThumbnailUploader } from './components/createlivestreampage/ThumbnailUploader';
import { ScheduleSection } from './components/createlivestreampage/ScheduleSection';
import { Tips } from './components/createlivestreampage/Tips';

export const CreateLivestreamPage: React.FC = () => {
  const t = useTranslations('livestream');
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productError, setProductError] = useState('');

  

  const [formData, setFormData] = useState<LivestreamForm>({
    title: '',
    description: '',
    thumbnail: '',
    products: [],
    isScheduled: false,
    scheduleDate: '',
    scheduleTime: '',
  });

  const canHostLivestream = Boolean(user && ['shop_owner', 'admin'].includes(user.role));

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  React.useEffect(() => {
    if (!authLoading && isAuthenticated && user && canHostLivestream) {
      let isMounted = true;
      const loadProducts = async () => {
        setIsLoadingProducts(true);
        setProductError('');
        try {
          const getProductsUseCase = container.getProductsUseCase;
          const result = await getProductsUseCase.execute({ owner: user.id, limit: 200 });
          if (!isMounted) return;
          setAvailableProducts(result.products || []);
        } catch {
          if (!isMounted) return;
          setProductError(t('errors.loadProductsFailed'));
        } finally {
          if (isMounted) {
            setIsLoadingProducts(false);
          }
        }
      };

      loadProducts();
      return () => {
        isMounted = false;
      };
    }
  }, [authLoading, canHostLivestream, isAuthenticated, t, user]);

  

  const priceFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => {
      const exists = prev.products.includes(productId);
      if (exists) {
        return { ...prev, products: prev.products.filter(id => id !== productId) };
      }
      return { ...prev, products: [...prev.products, productId] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError(t('errors.notAuthenticated'));
      return;
    }

    if (!canHostLivestream) {
      setError(t('errors.roleNotAllowed'));
      return;
    }

    if (!formData.title.trim()) {
      setError(t('errors.titleRequired'));
      return;
    }

    if (formData.products.length === 0) {
      setError(t('form.productsRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      let startTime: Date | undefined;
      
      if (formData.isScheduled && formData.scheduleDate && formData.scheduleTime) {
        const dateTimeString = `${formData.scheduleDate}T${formData.scheduleTime}`;
        startTime = new Date(dateTimeString);
      }

      const createDto: CreateLivestreamDto = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail || undefined,
        products: formData.products,
        startTime,
      };

      

      const createLivestreamUseCase = container.createLivestreamUseCase;
      const livestream = await createLivestreamUseCase.execute(createDto);

      

      if (!livestream || !livestream.id) {
        setError(t('errors.invalidResponse'));
        setIsSubmitting(false);
        return;
      }
      localStorage.getItem('authToken');

      if (formData.isScheduled) {
        
        router.push('/main/livestream');
      } else {
        
        router.push(`/main/livestream/${livestream.id}/host`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(t('errors.createFailed') + ' - ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!authLoading && isAuthenticated && user && !canHostLivestream) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg text-center">
          <div className="text-6xl mb-4">
            <Image src={ICONS.WARNING} alt={t('errors.roleNotAllowed')} width={64} height={64} />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">{t('errors.roleNotAllowed')}</p>
          <p className="text-sm text-gray-600 mb-6">{t('errors.roleNotAllowedHint')}</p>
          <button
            onClick={() => router.push('/main/livestream')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
          >
            {t('backToList')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4 transition"
          >
            <Image className="mr-2" src={ICONS.ARROW_LEFT} alt={t('back')} width={20} height={20} />
            {t('back')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('createTitle')}</h1>
          <p className="mt-2 text-gray-600">{t('createSubtitle')}</p>
        </div>

        
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <HostInfo user={user} avatarFailed={avatarFailed} setAvatarFailed={setAvatarFailed} />

            
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('form.title')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                 onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder={t('form.titlePlaceholder')}
              />
            </div>

            
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                {t('form.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>

            
            <ProductSelector
              availableProducts={availableProducts}
              isLoadingProducts={isLoadingProducts}
              productSearch={productSearch}
              setProductSearch={setProductSearch}
              formProducts={formData.products}
              onToggleProduct={handleProductToggle}
              priceFormatter={priceFormatter}
              productError={productError}
            />

            <ThumbnailUploader formData={formData} setFormData={setFormData} />

            {/* Schedule Section */}
            <ScheduleSection formData={formData} setFormData={setFormData} />
            

            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <Image src={ICONS.WARNING} alt={t('errors.createFailed')} width={20} height={20} />
                <span>{error}</span>
              </div>
            )}

            
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                {t('form.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('form.creating')}
                  </>
                ) : (
                  <>
                    <Image src={ICONS.VIDEO_CAMERA_ALT} alt={t('form.createAndStart')} width={20} height={20} />
                    {t('form.createAndStart')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <Tips />
      </div>
    </div>
  );
};
