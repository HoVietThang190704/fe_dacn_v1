import React, { useMemo } from 'react';
import Image from 'next/image';
import { PaymentMethod } from '../components/PaymentMethodSelector';
import { TranslateFn } from '../types';
import { ICONS } from '@/shared/constants/images';

export const usePaymentMethods = (t: TranslateFn) => useMemo<PaymentMethod[]>(
  () => [
    {
      value: 'cod',
      label: t('payment.options.cod'),
      icon: (
        <Image
          src={ICONS.PAYMENT_METHOD}
          alt={t('payment.options.cod')}
          width={24}
          height={24}
          className="object-contain"
        />
      ),
      disabled: false,
    },
    {
      value: 'vnpay',
      label: t('payment.options.vnpay'),
      icon: (
        <Image
          src={ICONS.WALLET}
          alt={t('payment.options.vnpay')}
          width={24}
          height={24}
          className="object-contain"
        />
      ),
      disabled: false,
    },
  ],
  [t]
);

export default usePaymentMethods;
