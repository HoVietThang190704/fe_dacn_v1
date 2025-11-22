import React from 'react';
import { useTranslations } from 'next-intl';

export const EmptyState: React.FC = () => {
  const t = useTranslations('notificationsPage');
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
        {t('empty.emoji')}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{t('empty.title')}</h3>
      <p className="mt-2 text-sm text-gray-500">{t('empty.description')}</p>
    </div>
  );
};
