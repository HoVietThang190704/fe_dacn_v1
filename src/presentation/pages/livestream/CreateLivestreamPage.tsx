'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/shared/hooks/useAuth';
import { container } from '@/presentation/di/container';
import { CreateLivestreamDto } from '@/domain/entities/Livestream';
import { Product } from '@/domain/entities/Product';

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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    products: [] as string[],
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
        } catch (err) {
          if (!isMounted) return;
          console.error('[CreateLivestream] Failed to load products', err);
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

  const filteredProducts = React.useMemo(() => {
    if (!productSearch.trim()) return availableProducts;
    const keyword = productSearch.trim().toLowerCase();
    return availableProducts.filter((product) => product.name.toLowerCase().includes(keyword));
  }, [availableProducts, productSearch]);

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

      console.log('[CreateLivestream] Creating with dto:', createDto);

      const createLivestreamUseCase = container.createLivestreamUseCase;
      const livestream = await createLivestreamUseCase.execute(createDto);

      console.log('[CreateLivestream] Created livestream:', livestream);

      if (!livestream || !livestream.id) {
        console.error('[CreateLivestream] Invalid response - no ID:', livestream);
        setError('Tạo livestream thành công nhưng không nhận được ID. Vui lòng kiểm tra danh sách livestream.');
        setIsSubmitting(false);
        return;
      }
      const token = localStorage.getItem('authToken');
      console.log('[CreateLivestream] Auth token exists:', !!token);

      if (formData.isScheduled) {
        // If scheduled, go back to list
        console.log('[CreateLivestream] Navigating to list (scheduled)');
        router.push('/main/livestream');
      } else {
        // If live now, go to host page
        console.log('[CreateLivestream] Navigating to host page:', `/main/livestream/${livestream.id}/host`);
        router.push(`/main/livestream/${livestream.id}/host`);
      }
    } catch (err) {
      console.error('[CreateLivestream] Error:', err);
      if (err instanceof Error) {
        console.error('[CreateLivestream] Error message:', err.message);
        console.error('[CreateLivestream] Error stack:', err.stack);
      }
      setError(t('errors.createFailed') + ' - ' + (err instanceof Error ? err.message : 'Unknown error'));
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
          <div className="text-6xl mb-4">⛔</div>
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
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('back')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('createTitle')}</h1>
          <p className="mt-2 text-gray-600">{t('createSubtitle')}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Host Info Display */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('hostInfo')}</h3>
              <div className="flex items-center gap-3">
                {user?.avatar && !avatarFailed ? (
                  <Image
                    src={user.avatar}
                    alt={user.userName || user.email}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={() => setAvatarFailed(true)}
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">
                    {(user?.userName || user?.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{user?.userName || user?.email}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Title */}
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

            {/* Description */}
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

            {/* Product Selection */}
            <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/40">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {t('form.productsLabel')} <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs text-gray-600">{t('form.productsHelper')}</p>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {t('form.productsCounter', { count: formData.products.length, total: availableProducts.length })}
                </span>
              </div>

              {isLoadingProducts ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  {t('form.productsLoading')}
                </div>
              ) : availableProducts.length === 0 ? (
                <div className="text-sm text-gray-600 bg-white rounded-lg p-4 border border-dashed border-gray-200">
                  <p>{t('form.productsEmpty')}</p>
                  <button
                    type="button"
                    onClick={() => router.push('/main/products/create')}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('form.createProductCta')}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={t('form.productSearchPlaceholder')}
                      className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                    {filteredProducts.map((product) => {
                      const isSelected = formData.products.includes(product.id);
                      return (
                        <label
                          key={product.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                            isSelected
                              ? 'border-purple-500 bg-white shadow-sm'
                              : 'border-gray-200 bg-white hover:border-purple-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleProductToggle(product.id)}
                            className="sr-only"
                          />
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-400'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {priceFormatter.format(product.price)} · {product.unit}
                            </p>
                          </div>
                          <span className="text-[11px] text-gray-400">#{product.id.slice(-4)}</span>
                        </label>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">{t('form.productsSearchEmpty')}</p>
                    )}
                  </div>
                  {formData.products.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.products.map((id) => {
                        const product = availableProducts.find((item) => item.id === id);
                        return (
                          <span
                            key={id}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full flex items-center gap-2"
                          >
                            <span className="truncate max-w-[140px]">{product?.name || id}</span>
                            <button
                              type="button"
                              onClick={() => handleProductToggle(id)}
                              className="text-purple-500 hover:text-purple-700"
                              aria-label="Remove product"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {productError && <p className="text-sm text-red-500 mt-2">{productError}</p>}
              {!isLoadingProducts && availableProducts.length > 0 && formData.products.length === 0 && (
                <p className="text-sm text-red-500 mt-2">{t('form.productsRequired')}</p>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('form.thumbnail')}
              </label>
              
              {/* File upload button */}
              <div className="flex gap-3">
                <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition cursor-pointer bg-gray-50 hover:bg-purple-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({ ...prev, thumbnail: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600">{t('form.uploadImage')}</span>
                </label>
              </div>

              {/* Or URL input */}
              <div className="mt-2">
                <input
                  type="url"
                  id="thumbnail"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                  placeholder={t('form.urlPlaceholder')}
                />
              </div>

              {formData.thumbnail && (
                <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={formData.thumbnail}
                    alt="Thumbnail preview"
                    fill
                    unoptimized
                    className="object-cover"
                    onError={(e) => {
                      // Hide the image if it fails to load
                      const target = e?.currentTarget as HTMLImageElement | undefined;
                      if (target) target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Schedule Section */}
            <div className="border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isScheduled"
                  name="isScheduled"
                  checked={formData.isScheduled}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      isScheduled: e.target.checked,
                      scheduleDate: '',
                      scheduleTime: ''
                    });
                  }}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isScheduled" className="ml-3 text-sm font-semibold text-gray-700">
                  {t('form.scheduleLabel')}
                </label>
              </div>

              {formData.isScheduled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                  <div>
                    <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('form.dateLabel')}
                    </label>
                    <input
                      type="date"
                      id="scheduleDate"
                      name="scheduleDate"
                      value={formData.scheduleDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required={formData.isScheduled}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('form.timeLabel')}
                    </label>
                    <input
                      type="time"
                      id="scheduleTime"
                      name="scheduleTime"
                      value={formData.scheduleTime}
                      onChange={handleInputChange}
                      required={formData.isScheduled}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                  {formData.scheduleDate && formData.scheduleTime && (
                    <div className="md:col-span-2 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                      <span className="font-medium">{t('form.startTimePreview')}</span>{' '}
                      {new Date(`${formData.scheduleDate}T${formData.scheduleTime}`).toLocaleString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Buttons */}
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {t('form.createAndStart')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {t('tips.title')}
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>{t('tips.tip1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>{t('tips.tip2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>{t('tips.tip3')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
