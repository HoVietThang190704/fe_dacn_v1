import Image from 'next/image';
import React from 'react';
import { ICONS } from '@/shared/constants/images';

type Props = {
  error: string;
  onRetry: () => void;
  t: (key: string) => string;
};

export const ErrorState: React.FC<Props> = ({ error, onRetry, t }) => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-lg">
      <Image src={ICONS.VERIFIED} alt={t('error')} width={96} height={96} className="mx-auto mb-5 h-20 w-20" />
      <h2 className="text-xl font-semibold text-gray-900">{t('error')}</h2>
      <p className="mt-2 text-sm text-gray-500">{error}</p>
      <button onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600">{t('retry')}</button>
    </div>
  </div>
);

export default ErrorState;
