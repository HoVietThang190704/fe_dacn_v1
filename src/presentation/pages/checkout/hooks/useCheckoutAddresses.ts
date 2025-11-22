import { useCallback, useEffect, useMemo, useState } from 'react';
import { usersAPI } from '@/lib/api';
import { checkoutConfig } from '@/config/checkoutConfig';
import { ShippingAddress, TranslateFn } from '../types';
import { buildProfileAddress, normalizeAddressesPayload } from '../utils/address';

interface UseCheckoutAddressesParams {
  t: TranslateFn;
  setError: (message: string | null) => void;
}

const { profileAddressId } = checkoutConfig;

type AddressLabel = 'home' | 'work' | 'other';

export interface AddressFormState {
  recipientName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  label: AddressLabel;
  isDefault: boolean;
}

const initialAddressState: AddressFormState = {
  recipientName: '',
  phone: '',
  address: '',
  ward: '',
  district: '',
  province: '',
  label: 'home',
  isDefault: false,
};

const tokenKeys = ['authToken', 'token', 'accessToken'];

const getAuthToken = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  for (const key of tokenKeys) {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      return stored;
    }
  }
  return '';
};

export const useCheckoutAddresses = ({ t, setError }: UseCheckoutAddressesParams) => {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [profileAddress, setProfileAddress] = useState<ShippingAddress | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState(initialAddressState);
  const [isCreatingAddress, setIsCreatingAddress] = useState(false);

  const displayAddresses = useMemo(() => {
    if (profileAddress) {
      const alreadyIncluded = addresses.some((addr) => addr.id === profileAddressId);
      if (alreadyIncluded) {
        return addresses;
      }
      return [profileAddress, ...addresses];
    }
    return addresses;
  }, [addresses, profileAddress]);

  const selectedAddress = useMemo(() => {
    if (selectedAddressId === profileAddressId) {
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

  const fetchAddresses = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    setIsLoadingAddresses(true);
    try {
      const [addressResp, profileResp] = await Promise.all([
        usersAPI.getUserAddresses(token),
        usersAPI.getMyProfile(token),
      ]);

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
        const fallbackAddrId = defaultAddr?.id ?? addrList[0]?.id ?? (profileAddr ? profileAddressId : '');
        return fallbackAddrId ?? '';
      });
    } catch {
      setError(t('errors.fetchAddresses'));
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [setError, t]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleCreateAddress = useCallback(async () => {
    const token = getAuthToken();
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

    if (
      !trimmedPayload.recipientName ||
      !trimmedPayload.phone ||
      !trimmedPayload.address ||
      !trimmedPayload.ward ||
      !trimmedPayload.district ||
      !trimmedPayload.province
    ) {
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
          ?? (profileAddress ? profileAddressId : '');

      setSelectedAddressId(preferredId ?? '');
      setShowAddAddressForm(false);
      setNewAddress(initialAddressState);
    } catch {
      setError(t('errors.addAddressFailed'));
    } finally {
      setIsCreatingAddress(false);
    }
  }, [newAddress, profileAddress, setError, t]);

  return {
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
  };
};
