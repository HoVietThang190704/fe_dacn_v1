import React from 'react';

const LoadingState: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{t('loading')}</p>
    </div>
  </div>
);

export default LoadingState;