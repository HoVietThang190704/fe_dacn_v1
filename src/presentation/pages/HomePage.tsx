'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { HeroBanner } from '@/components/ui/HeroBanner';
import CmsAdBanner from '@/components/home/CmsAdBanner';
import CategoriesCarousel from '@/components/home/CategoriesCarousel';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ProductCard from '../components/ProductCard';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';
import { container } from '../di/container';
import { Promotion } from '@/domain/entities/Banner';
import { Product } from '@/domain/entities/Product';
import { Banner } from '@/domain/entities/Banner';

interface StatCard {
  key: string;
  value: number;
  label: string;
  description: string;
}

export const HomePage: React.FC = () => {
  const t = useTranslations('home');
  const locale = useLocale();
  const { data, isLoading, error, refresh } = useHomeViewModel(container.getHomeDataUseCase);

  const stats = useMemo<StatCard[]>(() => {
    if (!data) return [];
    return [
      {
        key: 'categories',
        value: data.categories.length,
        label: t('stats.categories'),
        description: t('stats.categoriesDescription'),
      },
      {
        key: 'bestSellers',
        value: data.bestSellingProducts.length,
        label: t('stats.bestSellers'),
        description: t('stats.bestSellersDescription'),
      },
      {
        key: 'newProducts',
        value: data.newProducts.length,
        label: t('stats.newProducts'),
        description: t('stats.newProductsDescription'),
      },
      {
        key: 'promotions',
        value: data.promotions.length,
        label: t('stats.promotions'),
        description: t('stats.promotionsDescription'),
      },
    ];
  }, [data, t]);

  const displayedBestSellers = useMemo(
    () => {
      const list = data?.bestSellingProducts ?? [];
      return [...list].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 5);
    },
    [data?.bestSellingProducts]
  );

  const displayedNewProducts = useMemo(
    () => {
      const list = data?.newProducts ?? [];
      const isToday = (value?: string) => {
        if (!value) return false;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return false;
        const now = new Date();
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      };

  return list.filter((p) => isToday((p as Product & { harvestDate?: string }).harvestDate ?? (p as Product).createdAt));
    },
    [data?.newProducts]
  );

  const secondaryBanners = useMemo(
    () => (data?.banners ?? []).slice(1, 3),
    [data?.banners]
  );

  const aggregatedProducts = useMemo(() => {
    if (!data) return [] as Product[];
    const unique = new Map<string, Product>();
    [...(data.bestSellingProducts ?? []), ...(data.newProducts ?? [])].forEach((product) => {
      if (product && !unique.has(product.id)) {
        unique.set(product.id, product);
      }
    });
    return Array.from(unique.values());
  }, [data]);

  const shelfLifeGroups = useMemo(() => {
    const groups = {
      week: [] as Product[],
      twoWeeks: [] as Product[],
      month: [] as Product[],
      longTerm: [] as Product[],
    };

    const sortAndTrim = (items: Product[]) =>
      items
        .slice()
        .sort((a, b) => (a.shelfLife ?? Number.MAX_SAFE_INTEGER) - (b.shelfLife ?? Number.MAX_SAFE_INTEGER))
        .slice(0, 8);

    aggregatedProducts.forEach((product) => {
      const shelfLife = product.shelfLife;
      if (typeof shelfLife !== 'number') {
        return;
      }
      if (shelfLife <= 7) {
        groups.week.push(product);
      } else if (shelfLife <= 14) {
        groups.twoWeeks.push(product);
      } else if (shelfLife <= 30) {
        groups.month.push(product);
      } else {
        groups.longTerm.push(product);
      }
    });

    return {
      week: sortAndTrim(groups.week),
      twoWeeks: sortAndTrim(groups.twoWeeks),
      month: sortAndTrim(groups.month),
      longTerm: sortAndTrim(groups.longTerm),
    };
  }, [aggregatedProducts]);

  if (isLoading) {
    return <LoadingState t={t} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refresh} t={t} />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-10 py-4 sm:py-6 md:py-8">
        <HeroBanner onShopNowClick={() => (window.location.href = '/main/products')} />

        {/* CMS App-managed advertisement banner (Contentful) */}
        <CmsAdBanner />

        <StatsHighlight stats={stats} />

        <CategoriesCarousel categories={data.categories} />

        <BannerShowcase
          banners={secondaryBanners}
          title={t('sections.banners.title')}
          subtitle={t('sections.banners.subtitle')}
        />

        <PromotionsShowcase
          promotions={data.promotions}
          title={t('sections.promotions.title')}
          subtitle={t('sections.promotions.subtitle')}
          validUntilLabel={(date) => t('sections.promotions.validUntil', { date })}
          locale={locale}
        />

        <ProductShelf
          title={t('sections.bestSellers.title')}
          subtitle={t('sections.bestSellers.subtitle')}
          products={displayedBestSellers}
          href="/main/products"
          seeAllLabel={t('seeAll')}
        />

        <ProductShelf
          title={t('sections.newArrivals.title')}
          subtitle={t('sections.newArrivals.subtitle')}
          products={displayedNewProducts}
          href="/main/products"
          seeAllLabel={t('seeAll')}
        />

        <ProductShelf
          title={t('sections.shelfLife.week.title')}
          subtitle={t('sections.shelfLife.week.subtitle')}
          products={shelfLifeGroups.week}
          href="/main/products"
          seeAllLabel={t('seeAll')}
        />

        <ProductShelf
          title={t('sections.shelfLife.twoWeeks.title')}
          subtitle={t('sections.shelfLife.twoWeeks.subtitle')}
          products={shelfLifeGroups.twoWeeks}
          href="/main/products"
          seeAllLabel={t('seeAll')}
        />

        <ProductShelf
          title={t('sections.shelfLife.month.title')}
          subtitle={t('sections.shelfLife.month.subtitle')}
          products={shelfLifeGroups.month}
          href="/main/products"
          seeAllLabel={t('seeAll')}
        />

        <ProductShelf
          title={t('sections.shelfLife.longTerm.title')}
          subtitle={t('sections.shelfLife.longTerm.subtitle')}
          products={shelfLifeGroups.longTerm}
          href="/main/products"
          seeAllLabel={t('seeAll')}
        />
      </div>
    </div>
  );
};

const StatsHighlight: React.FC<{ stats: StatCard[] }> = ({ stats }) => {
  if (!stats.length) return null;

  return (
    <section className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <article
          key={stat.key}
          className="rounded-xl sm:rounded-2xl border border-emerald-100 bg-white p-3 sm:p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
        >
          <p className="text-xs sm:text-sm font-medium text-emerald-600 truncate">{stat.label}</p>
          <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500 line-clamp-2">{stat.description}</p>
        </article>
      ))}
    </section>
  );
};

const BannerShowcase: React.FC<{ banners: Banner[]; title: string; subtitle: string }> = ({ banners, title, subtitle }) => {
  if (!banners.length) return null;

  return (
    <section className="space-y-3 sm:space-y-4">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.ctaLink || '#'}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-600/90 to-teal-600 text-white shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative z-10 flex flex-col gap-2 sm:gap-3 p-4 sm:p-6">
              <p className="text-xs sm:text-sm uppercase tracking-wide text-emerald-100">{banner.subtitle}</p>
              <h3 className="text-lg sm:text-2xl font-semibold leading-tight line-clamp-2">{banner.title}</h3>
              <p className="text-xs sm:text-sm text-emerald-50/90 line-clamp-2">{banner.description}</p>
              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium backdrop-blur">
                {banner.ctaText}
                <span aria-hidden>→</span>
              </span>
            </div>
            <div className="absolute inset-y-0 right-0 w-24 sm:w-32 md:w-40 opacity-80">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const PromotionsShowcase: React.FC<{
  promotions: Promotion[];
  title: string;
  subtitle: string;
  locale: string;
  validUntilLabel: (date: string) => string;
}> = ({ promotions, title, subtitle, locale, validUntilLabel }) => {
  if (!promotions.length) return null;

  const displayedPromotions = promotions.slice(0, 3);

  const formatDate = (value: Date | string) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
  };

  return (
    <section className="space-y-3 sm:space-y-4">
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedPromotions.map((promotion) => {
          const validTo = promotion.validTo ? formatDate(promotion.validTo) : '';

          return (
            <article
              key={promotion.id}
              className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-orange-100 text-white shadow-md hover:shadow-lg transition-shadow min-h-[180px] sm:min-h-[200px]"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${promotion.backgroundColor} 0%, rgba(0,0,0,0.35) 100%)`,
                }}
                aria-hidden="true"
              />
              <div className="relative z-10 flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">
                <div>
                  <p className="text-xs sm:text-sm uppercase tracking-wide text-white/80 line-clamp-1">{promotion.title}</p>
                  <h3 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold">
                    -{promotion.discount}%
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-white/90 line-clamp-2">{promotion.description}</p>
                {validTo && (
                  <p className="text-xs text-white/70">{validUntilLabel(validTo)}</p>
                )}
              </div>
              {promotion.image && (
                <div className="absolute -bottom-4 right-0 h-24 w-24 sm:h-32 sm:w-32 opacity-80">
                  <Image src={promotion.image} alt={promotion.title} fill className="object-contain" />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};

const ProductShelf: React.FC<{
  title: string;
  subtitle?: string;
  products: Product[];
  href: string;
  seeAllLabel: string;
}> = ({ title, subtitle, products, href, seeAllLabel }) => {
  if (!products.length) return null;

  return (
    <section className="space-y-3 sm:space-y-4">
      <SectionHeader title={title} subtitle={subtitle} href={href} ctaLabel={seeAllLabel} />
      {/* Responsive grid - 2 cột mobile, 3 tablet, 4-5 desktop, 6 màn lớn */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

const SectionHeader: React.FC<{ title: string; subtitle?: string; href?: string; ctaLabel?: string }> = ({
  title,
  subtitle,
  href,
  ctaLabel,
}) => (
  <div className="flex flex-col gap-1 sm:gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div className="flex-1">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 line-clamp-2">{subtitle}</p>}
    </div>
    {href && ctaLabel && (
      <Link 
        href={href} 
        className="text-xs sm:text-sm font-medium text-orange-500 hover:text-orange-600 inline-flex items-center gap-1 self-start sm:self-auto whitespace-nowrap transition-colors"
      >
        {ctaLabel}
        <span aria-hidden className="text-base"></span>
      </Link>
    )}
  </div>
);
