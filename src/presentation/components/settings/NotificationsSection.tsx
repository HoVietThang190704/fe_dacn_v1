import React from 'react';
import { useTranslations } from 'next-intl';
import { ToggleSwitch } from './SharedSettingsComponents';

const NotificationsSection: React.FC = () => {
  const t = useTranslations('settings');

  return (
    <div className="px-2 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{t('notificationsTitle')}</h2>
        <p className="text-sm sm:text-base text-gray-600">{t('notificationsDesc')}</p>
      </div>

      <div className="bg-green-50 p-4 sm:p-6 rounded-2xl border border-green-100">
        <ToggleSwitch label={t('notif_order')} description={t('notif_order_desc')} enabled={true} />
        <ToggleSwitch label={t('notif_promo')} description={t('notif_promo_desc')} enabled={true} />
        <ToggleSwitch label={t('notif_new_product')} description={t('notif_new_product_desc')} enabled={false} />
        <ToggleSwitch label={t('notif_livestream')} description={t('notif_livestream_desc')} enabled={true} />
        <ToggleSwitch label={t('notif_community')} description={t('notif_community_desc')} enabled={false} />
      </div>
    </div>
  );
};

export default NotificationsSection;
