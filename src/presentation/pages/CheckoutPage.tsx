'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useCart } from '@/shared/hooks/useCart';
import { container } from '../di/container';
import { usersAPI } from '@/lib/api';

interface ShippingAddress {
  id?: string;
  recipientName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  note?: string;
  label?: string;
  isDefault?: boolean;
  fullAddress?: string;
}

const PROFILE_ADDRESS_ID = '__profile__';

const normalizeAddressesPayload = (payload: unknown): ShippingAddress[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload as ShippingAddress[];
  }

  if (typeof payload === 'object') {
    const root = payload as Record<string, unknown>;
    if (Array.isArray(root.data)) {
      return root.data as ShippingAddress[];
    }

    if (typeof root.data === 'object' && root.data !== null) {
      const nested = root.data as Record<string, unknown>;
      if (Array.isArray(nested.addresses)) {
        return nested.addresses as ShippingAddress[];
      }

      if (
        'recipientName' in nested &&
        'phone' in nested &&
        'address' in nested &&
        'district' in nested &&
        'province' in nested
      ) {
        return [nested as unknown as ShippingAddress];
      }
    }

    if (
      'recipientName' in root &&
      'phone' in root &&
      'address' in root &&
      'district' in root &&
      'province' in root
    ) {
      return [root as unknown as ShippingAddress];
    }
  }

  return [];
};

const buildProfileAddress = (payload: unknown, fallbackName: string): ShippingAddress | null => {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;
  const candidate = (root.data && typeof root.data === 'object' ? root.data : root) as Record<string, unknown>;

  if (!candidate) return null;

  const rawAddress = candidate.address;
  if (!rawAddress || typeof rawAddress !== 'object') return null;

  const address = rawAddress as Record<string, unknown>;

  const detail = typeof address.detail === 'string' && address.detail.trim()
    ? address.detail.trim()
    : typeof address.street === 'string' && address.street.trim()
      ? address.street.trim()
      : '';

  const ward = typeof address.commune === 'string' && address.commune.trim()
    ? address.commune.trim()
    : typeof address.ward === 'string' && address.ward.trim()
      ? address.ward.trim()
      : '';

  const district = typeof address.district === 'string' ? address.district.trim() : '';
  const province = typeof address.province === 'string' ? address.province.trim() : '';
  const phone = typeof candidate.phone === 'string' ? candidate.phone.trim() : '';

  const recipientName = typeof candidate.userName === 'string' && candidate.userName.trim()
    ? candidate.userName.trim()
    : typeof candidate.email === 'string' && candidate.email.includes('@')
      ? candidate.email.split('@')[0]
      : '';

  if (!detail || !district || !province || !phone) {
    return null;
  }

  const fullAddress = [detail, ward, district, province].filter(Boolean).join(', ');

  return {
    id: PROFILE_ADDRESS_ID,
  recipientName: recipientName || fallbackName,
    phone,
    address: detail,
    ward,
    district,
    province,
    fullAddress,
    isDefault: true,
    label: 'profile',
  };
};

interface VoucherInfo {
  code: string;
  discount: number;
  voucher: {
    id: string;
    code: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue: number;
    maxDiscountAmount?: number;
  };
}

const FALLBACK_IMAGE = '/img/Background.png';
const SHIPPING_FEE = 25000; // Default shipping fee

export const CheckoutPage = () => {
  const router = useRouter();
  const { cart, selectedIds, isLoading } = useCart();
  const t = useTranslations('checkout');
  const locale = useLocale();
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

  const paymentMethods = useMemo(
    () => [
      { value: 'cod' as const, label: t('payment.options.cod'), icon: '💰', disabled: false },
      { value: 'momo' as const, label: t('payment.options.momo'), icon: '🍑', disabled: true },
      { value: 'zalopay' as const, label: t('payment.options.zalopay'), icon: '⚡', disabled: true },
      { value: 'vnpay' as const, label: t('payment.options.vnpay'), icon: '🏦', disabled: true },
      { value: 'card' as const, label: t('payment.options.card'), icon: '💳', disabled: true },
    ],
    [t]
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'momo' | 'zalopay' | 'vnpay' | 'card'>('cod');
  const [orderNote, setOrderNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherInfo | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [profileAddress, setProfileAddress] = useState<ShippingAddress | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    label: 'home' as 'home' | 'work' | 'other',
    isDefault: false,
  });
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);

  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) return;

      setIsLoadingAddresses(true);
      try {
        const [addressResp, profileResp] = await Promise.all([usersAPI.getUserAddresses(token), usersAPI.getMyProfile(token)]);

        const addrList = addressResp.success ? normalizeAddressesPayload(addressResp.data) : [];
        if (addressResp.success) {
          setAddresses(addrList);
        } else if (addressResp.error) {
          setError(addressResp.error);
        }

        const profileAddr = profileResp.success
          ? buildProfileAddress(profileResp.data, t('address.profileNameFallback'))
          : null;
        setProfileAddress(profileAddr);

        setSelectedAddressId((prev) => {
          if (prev) return prev;
          const defaultAddr = addrList.find((addr) => Boolean(addr.isDefault && addr.id));
          const fallbackAddrId = defaultAddr?.id ?? addrList[0]?.id ?? (profileAddr ? PROFILE_ADDRESS_ID : '');
          return fallbackAddrId ?? '';
        });
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
        setError(t('errors.fetchAddresses'));
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [t]);

  const displayAddresses = useMemo(() => {
    if (profileAddress) {
      const alreadyIncluded = addresses.some((addr) => addr.id === PROFILE_ADDRESS_ID);
      if (alreadyIncluded) {
        return addresses;
      }
      return [profileAddress, ...addresses];
    }
    return addresses;
  }, [addresses, profileAddress]);

  const selectedAddress = useMemo(() => {
    if (selectedAddressId === PROFILE_ADDRESS_ID) {
      return profileAddress;
    }
    const byId = addresses.find((addr) => addr.id === selectedAddressId);
    if (byId) return byId;

    return (
      addresses.find((addr) => {
        if (addr.id) return false;
        const fallbackKey = `${addr.phone}-${addr.address}-${addr.district}-${addr.province}`;
        return fallbackKey === selectedAddressId;
      }) || null
    );
  }, [addresses, profileAddress, selectedAddressId]);

  const handleCreateAddress = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      setError(t('errors.authRequired'));
      return;
    }

    const trimmedPayload = {
      recipientName: newAddress.recipientName.trim(),
      phone: newAddress.phone.trim(),
      address: newAddress.address.trim(),
      ward: newAddress.ward.trim(),
      district: newAddress.district.trim(),
      province: newAddress.province.trim(),
      label: newAddress.label,
      isDefault: newAddress.isDefault,
    };

    if (!trimmedPayload.recipientName || !trimmedPayload.phone || !trimmedPayload.address || !trimmedPayload.ward || !trimmedPayload.district || !trimmedPayload.province) {
      setError(t('errors.addressIncomplete'));
      return;
    }

    try {
      setIsCreatingAddress(true);
      setError(null);

      const response = await usersAPI.createAddress(trimmedPayload, token);
      if (!response.success) {
        setError(response.error || t('errors.addAddressFailed'));
        return;
      }

      const addrResponse = await usersAPI.getUserAddresses(token);
      if (!addrResponse.success) {
        setError(addrResponse.error || t('errors.reloadAddressesFailed'));
        return;
      }

      const addrList = normalizeAddressesPayload(addrResponse.data);
      setAddresses(addrList);

      const created = normalizeAddressesPayload(response.data).find((addr) => addr.id);
      const preferredId = created?.id && addrList.some((addr) => addr.id === created.id)
        ? created.id
        : addrList.find((addr) => Boolean(addr.isDefault && addr.id))?.id
          ?? addrList[addrList.length - 1]?.id
          ?? (profileAddress ? PROFILE_ADDRESS_ID : '');

      setSelectedAddressId(preferredId ?? '');
      setShowAddAddressForm(false);
      setNewAddress({
        recipientName: '',
        phone: '',
        address: '',
        ward: '',
        district: '',
        province: '',
        label: 'home',
        isDefault: false,
      });
    } catch (createError) {
      console.error('Failed to create address:', createError);
      setError(t('errors.addAddressFailed'));
    } finally {
      setIsCreatingAddress(false);
    }
  }, [newAddress, profileAddress, t]);

  const createOrderUseCase = container.createOrderUseCase;
  const applyVoucherUseCase = container.applyVoucherUseCase;

  // Get selected items from cart
  const selectedItems = useMemo(() => {
    if (!cart?.items || selectedIds.size === 0) return [];
    return cart.items.filter((item) => selectedIds.has(item.id));
  }, [cart?.items, selectedIds]);

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity || 0), 0);
  }, [selectedItems]);

  const discount = appliedVoucher?.discount ?? 0;
  const total = subtotal + SHIPPING_FEE - discount;

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
    if (selectedItems.length === 0) {
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

    const shouldSendAddressObject = selectedAddressId === PROFILE_ADDRESS_ID || !selectedAddress.id;

    try {
      setIsProcessing(true);
      setError(null);

      // Create order payload
      const orderPayload = {
        cartItemIds: selectedItems.map((item) => item.id),
        paymentMethod,
        note: orderNote || undefined,
        voucherCode: appliedVoucher?.code || undefined,
        shippingAddressId: shouldSendAddressObject ? undefined : selectedAddress.id,
        shippingAddress: shouldSendAddressObject ? resolvedAddress : undefined,
        saveShippingAddress: false,
      };

      const newOrder = await createOrderUseCase.execute(orderPayload);

      // Clear selected items from cart after successful order
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cartSelectedIds');
      }

      // Success - redirect to order detail or orders page
      router.push(`/main/orders/${newOrder.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.createOrder'));
    } finally {
      setIsProcessing(false);
    }
  }, [selectedItems, paymentMethod, orderNote, appliedVoucher, selectedAddress, selectedAddressId, createOrderUseCase, router, t]);

  if (isLoading || !cart) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
        <span className="sr-only">{t('loading')}</span>
      </div>
    );
  }

  if (selectedItems.length === 0) {
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
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4"
          >
            ← {t('backToCart')}
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{t('title')}</h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{t('address.title')}</h2>
                {!showAddAddressForm && (
                  <button
                    onClick={() => setShowAddAddressForm(true)}
                    className="text-sm text-orange-500 hover:text-orange-600"
                  >
                    {t('address.add')}
                  </button>
                )}
              </div>
              
              {showAddAddressForm && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-3">{t('address.formTitle')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder={t('address.fields.recipientName')}
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, recipientName: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="text"
                      placeholder={t('address.fields.phone')}
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="text"
                      placeholder={t('address.fields.address')}
                      value={newAddress.address}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="text"
                      placeholder={t('address.fields.ward')}
                      value={newAddress.ward}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, ward: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="text"
                      placeholder={t('address.fields.district')}
                      value={newAddress.district}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, district: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="text"
                      placeholder={t('address.fields.province')}
                      value={newAddress.province}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, province: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <select
                      value={newAddress.label}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value as typeof prev.label }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="home">{addressLabelMap.home}</option>
                      <option value="work">{addressLabelMap.work}</option>
                      <option value="other">{addressLabelMap.other}</option>
                    </select>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      {t('address.setDefault')}
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateAddress}
                      disabled={isCreatingAddress}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                      {isCreatingAddress ? t('address.saving') : t('address.save')}
                    </button>
                    <button
                      onClick={() => setShowAddAddressForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      {t('actions.cancel')}
                    </button>
                  </div>
                </div>
              )}
              
              {isLoadingAddresses ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  <span className="sr-only">{t('address.loading')}</span>
                </div>
              ) : displayAddresses.length === 0 && !showAddAddressForm ? (
                <div className="text-center py-4 text-gray-500">
                  {t('address.empty')}{' '}
                  <button 
                    onClick={() => setShowAddAddressForm(true)}
                    className="text-orange-500 hover:text-orange-600 ml-1"
                  >
                    {t('address.emptyAction')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayAddresses.map((address) => {
                    const fallbackKey = `${address.phone}-${address.address}-${address.district}-${address.province}`;
                    const optionValue = address.id ?? fallbackKey;
                    const isSelected = selectedAddressId === optionValue;

                    return (
                      <label
                        key={address.id ?? fallbackKey}
                        className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingAddress"
                          value={optionValue}
                          checked={isSelected}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="mt-1 text-orange-500 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {address.recipientName} | {address.phone}
                          </div>
                          <div className="text-gray-600 text-sm mt-1">
                            {address.fullAddress || [address.address, address.ward, address.district, address.province]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                          {address.id === PROFILE_ADDRESS_ID ? (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded">
                              {t('address.badges.profile')}
                            </span>
                          ) : address.label ? (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {resolveAddressLabel(address.label)}
                            </span>
                          ) : null}
                          {address.isDefault && address.id !== PROFILE_ADDRESS_ID && (
                            <span className="inline-block mt-2 ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded">
                              {t('address.badges.default')}
                            </span>
                          )}
                          {address.note && (
                            <div className="text-xs text-gray-500 mt-1">{address.note}</div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('products.title')}</h2>
              <div className="space-y-4">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                    <Image
                      src={item.thumbnail || FALLBACK_IMAGE}
                      alt={item.title || t('products.fallbackAlt')}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <div className="text-sm text-gray-500 mt-1">
                        {t('products.quantity', { count: item.quantity })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-orange-500">
                        {formatCurrency((item.price ?? 0) * (item.quantity || 0))}
                      </div>
                      <div className="text-sm text-gray-400">
                        {t('products.pricePerUnit', {
                          price: formatCurrency(item.price ?? 0),
                          unit: item.unit ?? t('products.unitFallback'),
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voucher */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('voucher.title')}</h2>
              {appliedVoucher ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      ✓
                    </div>
                    <div>
                      <div className="font-medium text-green-700">{appliedVoucher.voucher.name}</div>
                      <div className="text-sm text-green-600">
                        {t('voucher.appliedDiscount', { amount: formatCurrency(appliedVoucher.discount) })}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    {t('voucher.remove')}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder={t('voucher.placeholder')}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={!voucherCode.trim() || isApplyingVoucher}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingVoucher ? t('voucher.applying') : t('voucher.apply')}
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('payment.title')}</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = paymentMethod === method.value;
                  const isDisabled = method.disabled;

                  return (
                    <label
                      key={method.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isDisabled ? 'opacity-60 cursor-not-allowed hover:border-gray-200' : 'cursor-pointer'}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={isSelected}
                        onChange={(e) => !isDisabled && setPaymentMethod(e.target.value as typeof paymentMethod)}
                        disabled={isDisabled}
                        className="text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-xl" aria-hidden="true">{method.icon}</span>
                      <span className="font-medium">
                        {method.label}
                        {isDisabled ? ` (${t('payment.comingSoon')})` : ''}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Order Note */}
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

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('summary.title')}</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>{t('summary.subtotalWithCount', { count: selectedItems.length })}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>{t('shippingFee')}</span>
                  <span>{formatCurrency(SHIPPING_FEE)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('summary.discount')}</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>{t('total')}</span>
                    <span className="text-orange-500">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={isProcessing || selectedItems.length === 0}
                className="w-full mt-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? t('processing') : t('placeOrder')}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                {t('terms')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};