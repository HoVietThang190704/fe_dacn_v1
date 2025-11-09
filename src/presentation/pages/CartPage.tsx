'use client';

import { useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCart } from '@/shared/hooks/useCart';
import { CartItem } from '@/domain/entities/Cart';

export function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const formatCurrency = useMemo<(value: number) => string>(
    () =>
      (value: number) =>
        new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(value),
    [locale]
  );
  const router = useRouter();
  const {
    cart,
    isLoading,
    isMutating,
    error,
    lastActionMessage,
    pendingItemId,
    totalQuantity,
    subtotal,
    loadCart,
    updateItemQuantity,
    removeItem,
    clearCart,
    setError,
    selectedIds,
    setSelectedIds,
  } = useCart();
  const translate = t as unknown as (key: string, values?: Record<string, unknown>) => string;
  const actionMessage = lastActionMessage ? translate(`messages.${lastActionMessage}`) : null;

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (!cart?.items || cart.items.length === 0) {
      if (selectedIds.size > 0) {
        setSelectedIds(new Set());
      }
      return;
    }

    const next = new Set<string>();
    cart.items.forEach((item) => {
      if (selectedIds.has(item.id)) {
        next.add(item.id);
      }
    });

    // Only update if different
    if (next.size !== selectedIds.size || [...next].some(id => !selectedIds.has(id))) {
      setSelectedIds(next);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, selectedIds]);  const items = useMemo(() => cart?.items ?? [], [cart]);
  const allSelected = items.length > 0 && selectedIds.size === items.length;

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  const selectedQuantity = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }, [selectedItems]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.price ?? 0), 0);
  }, [selectedItems]);

  const handleSelect = (itemId: string) => {
    const next = new Set(selectedIds);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    const parseStock = (v: unknown) => {
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
        return Math.floor(v);
      }
      return undefined;
    };

    const maxAvailable = parseStock(item.attrs?.stock) ?? 999;
    const requested = item.quantity + delta;
    const nextQuantity = Math.max(1, Math.min(maxAvailable, requested));
    if (nextQuantity === item.quantity) {
      // user tried to increase but reached maxAvailable
      if (delta > 0) {
        setError?.(t('errors.maxStock', { count: maxAvailable }));
        window.setTimeout(() => setError?.(null), 2000);
      }
      return;
    }

    await updateItemQuantity(item.id, nextQuantity);
  };

  const handleQuantityInput = async (item: CartItem, value: string) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return;
    }
    const parseStock = (v: unknown) => {
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
        return Math.floor(v);
      }
      return undefined;
    };
    const maxAvailable = parseStock(item.attrs?.stock) ?? 999;
    const clamped = Math.max(1, Math.min(maxAvailable, parsed));
    if (clamped === item.quantity) {
      if (parsed > maxAvailable) {
        setError?.(t('errors.maxStock', { count: maxAvailable }));
        window.setTimeout(() => setError?.(null), 2000);
      }
      return;
    }
    await updateItemQuantity(item.id, clamped);
  };

  const handleRemoveSelected = async () => {
    for (const id of selectedIds) {
      await removeItem(id);
    }
    setSelectedIds(new Set());
  };

  const handleClearErrors = () => setError(null);

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <Image src="/icons/shopping-cart.svg" alt={t('emptyAlt')} width={160} height={160} className="w-28 h-28 mb-6" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('emptyTitle')}</h2>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{t('emptySubtitle')}</p>
      <button
        onClick={() => router.push('/main/products')}
        className="px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition"
      >
        {t('continueShopping')}
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      <span className="sr-only">{t('loading')}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500">{t('totalItems', { count: totalQuantity })}</p>
          </div>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRemoveSelected}
                disabled={selectedIds.size === 0 || isMutating}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                {t('removeSelected')}
              </button>
              <button
                onClick={async () => {
                  await clearCart();
                  setSelectedIds(new Set());
                }}
                disabled={items.length === 0 || isMutating}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                {t('clearCart')}
              </button>
            </div>
          )}
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 flex items-start justify-between gap-3">
            <span>{error}</span>
            <button onClick={handleClearErrors} className="text-red-500 hover:text-red-600 font-medium">
              {t('dismiss')}
            </button>
          </div>
        )}

        {actionMessage && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {actionMessage}
          </div>
        )}

        {isLoading ? (
          renderLoading()
        ) : items.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 lg:gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden lg:grid grid-cols-12 items-center px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <div className="col-span-5 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                  />
                  <span>{t('product')}</span>
                </div>
                <div className="col-span-2 text-center">{t('unitPrice')}</div>
                <div className="col-span-2 text-center">{t('quantity')}</div>
                <div className="col-span-2 text-center">{t('lineTotal')}</div>
                <div className="col-span-1 text-center">{t('actions')}</div>
              </div>

              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const lineTotal = (item.price ?? 0) * (item.quantity || 0);
                  const isItemUpdating = pendingItemId === item.id && isMutating;
                  const maxAvailable = typeof item.attrs?.stock === 'number' ? (item.attrs.stock as number) : 999;

                  return (
                    <li key={item.id} className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 lg:gap-6">
                        <div className="lg:col-span-5 flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelect(item.id)}
                            className="mt-2 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                          />
                          <div className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                              <Image
                                src={item.thumbnail || '/icons/shopping-cart.svg'}
                                alt={item.title || 'Product'}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900 text-sm sm:text-base">{item.title || t('unknownProduct')}</p>
                              <p className="text-xs text-gray-500">{t('sku', { id: item.productId })}</p>
                              {item.unit && <p className="text-xs text-gray-400">{t('unitLabel', { unit: item.unit })}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-2 text-sm font-semibold text-gray-900 text-left lg:text-center">
                          {formatCurrency(item.price ?? 0)}
                        </div>

                        <div className="lg:col-span-2">
                          <div className="inline-flex items-center border border-gray-200 rounded-full overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={item.quantity <= 1 || isItemUpdating}
                              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                              aria-label={t('decreaseQuantity')}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={maxAvailable}
                              value={item.quantity}
                              onChange={(event) => handleQuantityInput(item, event.target.value)}
                              className="w-12 text-center text-sm font-semibold text-gray-800 focus:outline-none"
                            />
                            <button
                              onClick={() => handleQuantityChange(item, 1)}
                              disabled={isItemUpdating || (item.quantity >= maxAvailable)}
                              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                              aria-label={t('increaseQuantity')}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="lg:col-span-2 text-sm font-semibold text-orange-500 text-left lg:text-center">
                          {formatCurrency(lineTotal)}
                        </div>

                        <div className="lg:col-span-1 text-right lg:text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isItemUpdating}
                            className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-40"
                          >
                            {t('remove')}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 h-fit self-start">
              <h2 className="text-lg font-semibold text-gray-900">{t('summaryTitle')}</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>{t('itemsSelected')}</span>
                  <span className="font-medium text-gray-800">{selectedQuantity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('itemsTotal')}</span>
                  <span className="font-medium text-gray-800">{formatCurrency(selectedSubtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('cartSubtotal')}</span>
                  <span className="font-semibold text-orange-500">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push('/main/checkout')}
                disabled={selectedIds.size === 0 || isMutating}
                className="w-full py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-60"
              >
                {t('checkout')}
              </button>
              <p className="text-xs text-gray-400 text-center">{t('checkoutNote')}</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
