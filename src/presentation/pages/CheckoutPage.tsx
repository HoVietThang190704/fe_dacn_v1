'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCart } from '@/shared/hooks/useCart';
import { container } from '../di/container';
import { checkoutConfig } from '@/config/checkoutConfig';
import { useCheckoutAddresses } from './checkout/hooks/useCheckoutAddresses';
import { usePaymentMethods } from './checkout/hooks/usePaymentMethods';
import { PaymentMethodSelector } from './checkout/components/PaymentMethodSelector';
import { AddressSection } from './checkout/components/AddressSection';
import { ProductList } from './checkout/components/ProductList';
import { VoucherSection } from './checkout/components/VoucherSection';
import { OrderSummaryCard } from './checkout/components/OrderSummaryCard';
import { VoucherInfo } from './checkout/types';

const { shippingFee, profileAddressId } = checkoutConfig;

export const CheckoutPage = () => {
  const router = useRouter();
  const { cart, selectedIds, isLoading } = useCart();
  const t = useTranslations('checkout');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay'>('cod');
  const [orderNote, setOrderNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherInfo | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const {
    displayAddresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
    showAddAddressForm,
    setShowAddAddressForm,
    newAddress,
    setNewAddress,
    isCreatingAddress,
    isLoadingAddresses,
    handleCreateAddress,
  } = useCheckoutAddresses({ t, setError });

  const buyNowItem = useMemo(() => {
    if (!isBuyNow) return null;
    const productId = searchParams.get('productId');
    const quantity = parseInt(searchParams.get('quantity') || '1');
    const price = parseFloat(searchParams.get('price') || '0');
    const title = searchParams.get('title') || '';
    const thumbnail = searchParams.get('thumbnail') || '';
    const unit = searchParams.get('unit') || '';
    if (!productId || !title) return null;
    return {
      id: `buynow-${productId}`,
      productId,
      quantity,
      price,
      title,
      thumbnail,
      unit,
    };
  }, [isBuyNow, searchParams]);

  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(value),
    [locale]
  );

  const addressLabelMap = useMemo(
    () => ({
      home: t('address.labels.home'),
      work: t('address.labels.work'),
      other: t('address.labels.other'),
      profile: t('address.labels.profile'),
    }),
    [t]
  );

  const resolveAddressLabel = useCallback(
    (label?: string | null) => {
      if (!label) return '';
      const key = label as keyof typeof addressLabelMap;
      return addressLabelMap[key] ?? label;
    },
    [addressLabelMap]
  );

  const paymentMethods = usePaymentMethods(t);

  const createOrderUseCase = container.createOrderUseCase;
  const applyVoucherUseCase = container.applyVoucherUseCase;
  const createVNPayPaymentSessionUseCase = container.createVNPayPaymentSessionUseCase;

  const selectedItems = useMemo(() => {
    if (isBuyNow && buyNowItem) {
      return [buyNowItem];
    }
    if (!cart?.items || selectedIds.size === 0) return [];
    return cart.items.filter((item) => selectedIds.has(item.id));
  }, [isBuyNow, buyNowItem, cart?.items, selectedIds]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity || 0), 0);
  }, [selectedItems]);

  const discount = appliedVoucher?.discount ?? 0;
  const total = subtotal + shippingFee - discount;

  const handleApplyVoucher = useCallback(async () => {
    if (!voucherCode.trim()) {
      setError(t('errors.voucherRequired'));
      return;
    }

    try {
      setIsApplyingVoucher(true);
      setError(null);
      const result = await applyVoucherUseCase.execute(voucherCode.trim(), subtotal);
      setAppliedVoucher({
        code: voucherCode.trim(),
        discount: result.discount,
        voucher: result.voucher,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.applyVoucher'));
      setAppliedVoucher(null);
    } finally {
      setIsApplyingVoucher(false);
    }
  }, [voucherCode, subtotal, applyVoucherUseCase, t]);

  const handleRemoveVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setVoucherCode('');
  }, []);

  const handleCreateOrder = useCallback(async () => {
    if (selectedItems.length === 0 && !buyNowItem) {
      setError(t('errors.noItemsSelected'));
      return;
    }

    if (!selectedAddress) {
      setError(t('errors.noAddressSelected'));
      return;
    }

    const sanitize = (value?: string | null) => (typeof value === 'string' ? value.trim() : '');
    const resolvedAddress = {
      recipientName: sanitize(selectedAddress.recipientName),
      phone: sanitize(selectedAddress.phone),
      address: sanitize(selectedAddress.address),
      ward: sanitize(selectedAddress.ward),
      district: sanitize(selectedAddress.district),
      province: sanitize(selectedAddress.province),
      note: selectedAddress.note ? selectedAddress.note.trim() : undefined,
      label: selectedAddress.label,
      isDefault: selectedAddress.isDefault,
    };

    if (!resolvedAddress.recipientName || !resolvedAddress.phone || !resolvedAddress.address || !resolvedAddress.district || !resolvedAddress.province) {
      setError(t('errors.addressIncompleteForOrder'));
      return;
    }

    const shouldSendAddressObject = selectedAddressId === profileAddressId || !selectedAddress.id;

    try {
      setIsProcessing(true);
      setError(null);

      const orderPayload = isBuyNow && buyNowItem ? {
        productId: buyNowItem.productId,
        quantity: buyNowItem.quantity,
        paymentMethod,
        note: orderNote || undefined,
        voucherCode: appliedVoucher?.code || undefined,
        shippingAddressId: shouldSendAddressObject ? undefined : selectedAddress.id,
        shippingAddress: shouldSendAddressObject ? resolvedAddress : undefined,
        saveShippingAddress: false,
      } : {
        cartItemIds: selectedItems.map((item) => item.id),
        paymentMethod,
        note: orderNote || undefined,
        voucherCode: appliedVoucher?.code || undefined,
        shippingAddressId: shouldSendAddressObject ? undefined : selectedAddress.id,
        shippingAddress: shouldSendAddressObject ? resolvedAddress : undefined,
        saveShippingAddress: false,
      };

      const newOrder = await createOrderUseCase.execute(orderPayload);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('cartSelectedIds');
      }

      if (paymentMethod === 'vnpay') {
        const frontendRedirectUrl = typeof window !== 'undefined'
          ? `${window.location.origin}/${locale}/payment/vnpay/result`
          : undefined;
        const vnPayLocale = locale?.toLowerCase().startsWith('vi') ? 'vn' : 'en';

        try {
          const session = await createVNPayPaymentSessionUseCase.execute({
            orderId: newOrder.id,
            frontendRedirectUrl,
            locale: vnPayLocale,
          });
          window.location.href = session.paymentUrl;
          return;
        } catch (paymentError) {
          setError(paymentError instanceof Error ? paymentError.message : t('errors.createOrder'));
          return;
        }
      }

      router.push(`/main/orders/${newOrder.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.createOrder'));
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, paymentMethod, orderNote, appliedVoucher, selectedAddress, selectedAddressId, createOrderUseCase, router, t, isBuyNow, buyNowItem, locale, createVNPayPaymentSessionUseCase]);

  if (isLoading || !cart) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  if (selectedItems.length === 0 && !buyNowItem) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-gray-400 text-6xl mb-4" aria-hidden="true">🛒</div>
          <h2 className="text-xl font-semibold mb-2">{t('noItems')}</h2>
          <p className="text-gray-600 mb-6">{t('noItemsMessage')}</p>
          <button
            onClick={() => router.push('/main/cart')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t('backToCartButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            ← {isBuyNow ? t('backToProduct') : t('backToCart')}
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AddressSection
              t={t}
              addressLabelMap={addressLabelMap}
              displayAddresses={displayAddresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              showAddAddressForm={showAddAddressForm}
              setShowAddAddressForm={setShowAddAddressForm}
              newAddress={newAddress}
              setNewAddress={setNewAddress}
              isCreatingAddress={isCreatingAddress}
              isLoadingAddresses={isLoadingAddresses}
              handleCreateAddress={handleCreateAddress}
              resolveAddressLabel={resolveAddressLabel}
            />

            <ProductList items={selectedItems} t={t} formatCurrency={formatCurrency} />

            <VoucherSection
              appliedVoucher={appliedVoucher}
              voucherCode={voucherCode}
              onVoucherCodeChange={setVoucherCode}
              onApply={handleApplyVoucher}
              onRemove={handleRemoveVoucher}
              isApplying={isApplyingVoucher}
              formatCurrency={formatCurrency}
              t={t}
            />

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('payment.title')}</h2>
              <PaymentMethodSelector
                methods={paymentMethods}
                selected={paymentMethod}
                onChange={(value) => setPaymentMethod(value)}
                comingSoonLabel={t('payment.comingSoon')}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('note.title')}</h2>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder={t('note.placeholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummaryCard
              itemCount={selectedItems.length}
              subtotal={subtotal}
              shippingFee={shippingFee}
              discount={discount}
              total={total}
              formatCurrency={formatCurrency}
              onSubmit={handleCreateOrder}
              isProcessing={isProcessing}
              canSubmit={selectedItems.length > 0}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
};