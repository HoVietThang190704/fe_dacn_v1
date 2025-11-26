import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';

const ErrorState: React.FC<{ error: string; onRetry: () => void; t: (key: string) => string }> = ({ error, onRetry, t }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="mb-4">
        <Image
          src={ICONS.WARNING}
          alt={String(t('error'))}
          width={56}
          height={56}
          className="mx-auto"
        />
      </div>
      <h2 className="text-xl font-semibold mb-2">{t('error')}</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        {t('retry')}
      </button>
    </div>
  </div>
);

export default ErrorState;