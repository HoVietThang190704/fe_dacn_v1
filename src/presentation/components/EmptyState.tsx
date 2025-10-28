import React from 'react';

const EmptyState: React.FC<{ t: (key: string) => string }> = ({ t }) => (
  <div className="text-center py-12 bg-white rounded-lg">
    <div className="text-gray-400 text-6xl mb-4">💚</div>
    <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('emptyTitle')}</h3>
    <p className="text-gray-500 mb-6">
      {t('emptyDesc')}
    </p>
    <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
      {t('discover')}
    </button>
  </div>
);

export default EmptyState;