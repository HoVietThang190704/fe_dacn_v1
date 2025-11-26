import React from 'react';

type Props = { t: (key: string) => string };

export const LoadingState: React.FC<Props> = ({ t }) => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-orange-400 border-t-transparent" />
      <p className="text-sm text-gray-500">{t('loading')}</p>
    </div>
  </div>
);

export default LoadingState;
