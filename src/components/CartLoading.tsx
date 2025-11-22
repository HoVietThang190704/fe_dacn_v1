import { useTranslations } from 'next-intl';

export function CartLoading() {
  const t = useTranslations('cart');

  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      <span className="sr-only">{t('loading')}</span>
    </div>
  );
}