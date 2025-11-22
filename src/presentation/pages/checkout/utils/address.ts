import { checkoutConfig } from '@/config/checkoutConfig';
import { ShippingAddress } from '../types';

const { profileAddressId } = checkoutConfig;

export const normalizeAddressesPayload = (payload: unknown): ShippingAddress[] => {
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

export const buildProfileAddress = (payload: unknown, fallbackName: string): ShippingAddress | null => {
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
    id: profileAddressId,
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
