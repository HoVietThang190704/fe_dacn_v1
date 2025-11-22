'use client';

import { useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/shared/hooks/useCart';
import { CartItem } from '@/components/CartItem';
import { CartEmptyState } from '@/components/CartEmptyState';
import { CartLoading } from '@/components/CartLoading';
import { CartSummary } from '@/components/CartSummary';

export function CartPage() {
  const t = useTranslations('cart');
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

    if (next.size !== selectedIds.size || [...next].some(id => !selectedIds.has(id))) {
      setSelectedIds(next);
    }
  }, [cart, selectedIds, setSelectedIds]);

  const items = useMemo(() => cart?.items ?? [], [cart]);
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

  const handleRemoveSelected = async () => {
    for (const id of selectedIds) {
      await removeItem(id);
    }
    setSelectedIds(new Set());
  };

  const handleClearErrors = () => setError(null);

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
          <CartLoading />
        ) : items.length === 0 ? (
          <CartEmptyState />
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
                  const isItemUpdating = pendingItemId === item.id && isMutating;

                  return (
                    <CartItem
                      key={item.id}
                      item={item}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                      onRemove={removeItem}
                      isItemUpdating={isItemUpdating}
                      updateItemQuantity={updateItemQuantity}
                      setError={setError}
                    />
                  );
                })}
              </ul>
            </div>

            <CartSummary
              selectedQuantity={selectedQuantity}
              selectedSubtotal={selectedSubtotal}
              subtotal={subtotal}
              selectedIdsSize={selectedIds.size}
              isMutating={isMutating}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
