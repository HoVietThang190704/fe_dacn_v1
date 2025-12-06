import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function CartEmptyState() {
  const t = useTranslations('cart');
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Image src={ICONS.SHOPPING_CART} alt={t('emptyAlt')} width={160} height={160} className="w-28 h-28 mb-6" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('emptyTitle')}</h2>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{t('emptySubtitle')}</p>
      <button
        onClick={() => router.push('/main/products')}
        className="px-6 py-2.5 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-600 transition"
      >
        {t('continueShopping')}
      </button>
    </div>
  );
}