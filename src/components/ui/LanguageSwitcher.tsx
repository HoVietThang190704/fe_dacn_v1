'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLanguage = () => {
    const newLocale = locale === 'vi' ? 'en' : 'vi';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={switchLanguage}
      className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium shadow-lg hover:bg-white transition-all duration-200 flex items-center gap-2"
    >
      <span className="text-lg">🌐</span>
      <span>{locale === 'vi' ? 'English' : 'Tiếng Việt'}</span>
    </button>
  );
}