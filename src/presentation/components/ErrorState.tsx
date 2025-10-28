import React from 'react';

const ErrorState: React.FC<{ error: string; onRetry: () => void; t: (key: string) => string }> = ({ error, onRetry, t }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-red-500 text-5xl mb-4">⚠️</div>
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