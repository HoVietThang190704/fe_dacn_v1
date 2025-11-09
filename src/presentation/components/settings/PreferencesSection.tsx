"use client"

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { ToggleSwitch, TimeZoneSelector } from './SharedSettingsComponents';

const PreferencesSection: React.FC = () => {
  const t = useTranslations('settings');

  const router = useRouter();
  const pathname = usePathname() || '/';
  const locale = useLocale();

  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Ho_Chi_Minh');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      const enabled = JSON.parse(saved);
      setIsDarkMode(enabled);
      document.documentElement.classList.toggle('dark', enabled);
    }
  }, []);

  const handleToggleDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
    document.documentElement.classList.toggle('dark', enabled);
    localStorage.setItem('darkMode', JSON.stringify(enabled));
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    try {
      // replace the first occurrence of the current locale in the path
      const newPath = pathname.startsWith(`/${locale}`)
        ? pathname.replace(`/${locale}`, `/${newLocale}`)
        : `/${newLocale}${pathname}`;
      router.push(newPath);
    } catch {
      // fallback: navigate to root with new locale
      router.push(`/${newLocale}`);
    }
  };

  return (
    <div className="px-2 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">{t('preferences')}</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('preferencesDesc')}</p>
      </div>

      <div className="bg-green-50 dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border border-green-100 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pref_language')}</label>
        <select
          aria-label={t('pref_language')}
          value={locale}
          onChange={handleLangChange}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="vi" >{t('lang_vietnamese')} </option>
          <option value="en">{t('lang_english')}</option>
        </select>
        <TimeZoneSelector
          label={t('pref_timezone')}
          value={selectedTimezone}
          onChange={(tz) => {
            // @ts-expect-error react-timezone-select ITimezone has value property
            setSelectedTimezone(tz.value);
          }}
        />
      </div>

      <div className="bg-green-50 dark:bg-gray-800 p-4 sm:p-6 rounded-2xl border border-green-100 dark:border-gray-700">
        <ToggleSwitch label={t('darkMode')} description={t('darkModeDesc')} enabled={isDarkMode} onToggle={handleToggleDarkMode} />
      </div>

      <div className="bg-red-50 dark:bg-red-900 p-4 sm:p-6 rounded-2xl border border-red-100 dark:border-red-700">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">{t('dangerous_zone')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('dangerous_desc')}</p>
        <Button variant="outline" className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400">{t('deleteAccount')}</Button>
      </div>
    </div>
  );
};

export default PreferencesSection;
