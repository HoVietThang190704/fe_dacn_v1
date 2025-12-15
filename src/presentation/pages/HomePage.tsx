'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import { ProductCategory } from '@/domain/entities/Product';

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

  const [categoryShelves, setCategoryShelves] = useState<Record<string, Product[]>>({});
  const [isCategoryShelvesLoading, setIsCategoryShelvesLoading] = useState(false);

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
      return [...list].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)).slice(0, 6);
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

  const normalizeSlug = (value?: string) => (value ?? '').trim().toLowerCase().replace(/_/g, '-');

  const collectDescendants = (categories: ProductCategory[], rootIds: string[]) => {
    const byParent = new Map<string | null | undefined, ProductCategory[]>();
    categories.forEach((c) => {
      const list = byParent.get(c.parentId) ?? [];
      list.push(c);
      byParent.set(c.parentId, list);
    });

    const visited = new Set<string>();
    const queue = [...rootIds];
    while (queue.length) {
      const current = queue.shift();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      const children = byParent.get(current) ?? [];
      children.forEach((child) => queue.push(child.id));
    }

    return Array.from(visited);
  };

  const findCategoryBySlugOrName = (
    categories: ProductCategory[],
    options: { slugs?: string[]; nameIncludes?: string[] }
  ) => {
    const slugSet = new Set((options.slugs ?? []).map((s) => normalizeSlug(s)));
    const nameNeedles = (options.nameIncludes ?? []).map((s) => s.toLowerCase());
    return categories.find((c) => {
      const slug = normalizeSlug(c.slug);
      const name = (c.name ?? '').toLowerCase();
      const matchesSlug = slug && slugSet.size > 0 ? slugSet.has(slug) : false;
      const matchesName = nameNeedles.length > 0 ? nameNeedles.some((n) => name.includes(n)) : false;
      return matchesSlug || matchesName;
    });
  };

  useEffect(() => {
    if (!data?.categories?.length) return;

    const loadCategoryShelves = async () => {
      setIsCategoryShelvesLoading(true);
      try {
        const categories = data.categories;

        const shelves: Array<{
          key: string;
          title: string;
          subtitle: string;
          categoryIds: string[];
        }> = [];

        const isVi = locale?.toLowerCase().startsWith('vi');

        const seafood = findCategoryBySlugOrName(categories, { slugs: ['hai-san'], nameIncludes: ['hải sản'] });
        if (seafood?.id) {
          shelves.push({
            key: 'seafood',
            title: isVi ? 'Hải sản' : 'Seafood',
            subtitle: isVi ? 'Tươi sống mỗi ngày' : 'Fresh seafood daily',
            categoryIds: [seafood.id],
          });
        }

        const meat = findCategoryBySlugOrName(categories, { slugs: ['thit'], nameIncludes: ['thịt'] });
        if (meat?.id) {
          shelves.push({
            key: 'meat',
            title: isVi ? 'Thịt' : 'Meat',
            subtitle: isVi ? 'Chọn lọc nguồn gốc rõ ràng' : 'Carefully selected cuts',
            categoryIds: [meat.id],
          });
        }

        const vegetableRoots = categories.filter((c) => {
          const slug = normalizeSlug(c.slug);
          const name = (c.name ?? '').toLowerCase();
          return slug.includes('rau') || name.includes('rau');
        });

        const vegetableIds = collectDescendants(categories, vegetableRoots.map((c) => c.id));

        if (vegetableIds.length) {
          shelves.push({
            key: 'vegetables',
            title: isVi ? 'Rau' : 'Vegetables',
            subtitle: isVi ? 'Rau củ tươi ngon' : 'Fresh vegetables',
            categoryIds: vegetableIds,
          });
        }

        const eggs = findCategoryBySlugOrName(categories, { slugs: ['eggs', 'trung'], nameIncludes: ['trứng'] });
        const milk = findCategoryBySlugOrName(categories, { slugs: ['sua', 'milk'], nameIncludes: ['sữa'] });
        const eggsMilkIds = [eggs?.id, milk?.id].filter(Boolean) as string[];
        if (eggsMilkIds.length) {
          shelves.push({
            key: 'eggsMilk',
            title: isVi ? 'Trứng & Sữa' : 'Eggs & Milk',
            subtitle: isVi ? 'Bữa sáng dinh dưỡng' : 'Daily essentials',
            categoryIds: eggsMilkIds,
          });
        }

        const fruits = findCategoryBySlugOrName(categories, { slugs: ['trai-cay'], nameIncludes: ['trái cây'] });
        if (fruits?.id) {
          shelves.push({
            key: 'fruits',
            title: isVi ? 'Trái cây' : 'Fruits',
            subtitle: isVi ? 'Giàu vitamin, tươi ngon' : 'Fresh & full of vitamins',
            categoryIds: [fruits.id],
          });
        }

        const fetchForShelf = async (categoryIds: string[]) => {
          const results = await Promise.allSettled(
            categoryIds.map((categoryId) =>
              container.getProductsUseCase.execute({ category: categoryId, limit: 12, sortBy: 'createdAt', order: 'desc' })
            )
          );
          const unique = new Map<string, Product>();
          results.forEach((r) => {
            if (r.status !== 'fulfilled') return;
            (r.value.products ?? []).forEach((p) => {
              if (p && !unique.has(p.id)) unique.set(p.id, p);
            });
          });
          return Array.from(unique.values()).slice(0, 6);
        };

        const shelfResults = await Promise.all(
          shelves.map(async (s) => ({
            key: s.key,
            title: s.title,
            subtitle: s.subtitle,
            products: await fetchForShelf(s.categoryIds),
          }))
        );

        setCategoryShelves((prev) => {
          const next = { ...prev };
          shelfResults.forEach((r) => {
            next[r.key] = r.products;
          });
          return next;
        });
      } catch (e) {
        console.error('Error loading category shelves:', e);
      } finally {
        setIsCategoryShelvesLoading(false);
      }
    };

    loadCategoryShelves();
  }, [data?.categories, locale]);

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
          variant="bestSeller"
        />

        <ProductShelf
          title={locale?.toLowerCase().startsWith('vi') ? 'Sản phẩm thu hoạch hôm nay' : 'Harvested Today'}
          subtitle={locale?.toLowerCase().startsWith('vi') ? 'Tươi mới trong ngày' : 'Freshly harvested today'}
          products={displayedNewProducts}
          href="/main/products"
          seeAllLabel={t('seeAll')}
        />

        {!isCategoryShelvesLoading && (
          <>
            <ProductShelf
              title={locale?.toLowerCase().startsWith('vi') ? 'Hải sản' : 'Seafood'}
              subtitle={locale?.toLowerCase().startsWith('vi') ? 'Tươi sống mỗi ngày' : 'Fresh seafood daily'}
              products={categoryShelves.seafood ?? []}
              href="/main/products"
              seeAllLabel={t('seeAll')}
            />

            <ProductShelf
              title={locale?.toLowerCase().startsWith('vi') ? 'Thịt' : 'Meat'}
              subtitle={locale?.toLowerCase().startsWith('vi') ? 'Chọn lọc nguồn gốc rõ ràng' : 'Carefully selected cuts'}
              products={categoryShelves.meat ?? []}
              href="/main/products"
              seeAllLabel={t('seeAll')}
            />

            <ProductShelf
              title={locale?.toLowerCase().startsWith('vi') ? 'Rau' : 'Vegetables'}
              subtitle={locale?.toLowerCase().startsWith('vi') ? 'Rau củ tươi ngon' : 'Fresh vegetables'}
              products={categoryShelves.vegetables ?? []}
              href="/main/products"
              seeAllLabel={t('seeAll')}
            />

            <ProductShelf
              title={locale?.toLowerCase().startsWith('vi') ? 'Trứng & Sữa' : 'Eggs & Milk'}
              subtitle={locale?.toLowerCase().startsWith('vi') ? 'Bữa sáng dinh dưỡng' : 'Daily essentials'}
              products={categoryShelves.eggsMilk ?? []}
              href="/main/products"
              seeAllLabel={t('seeAll')}
            />

            <ProductShelf
              title={locale?.toLowerCase().startsWith('vi') ? 'Trái cây' : 'Fruits'}
              subtitle={locale?.toLowerCase().startsWith('vi') ? 'Giàu vitamin, tươi ngon' : 'Fresh & full of vitamins'}
              products={categoryShelves.fruits ?? []}
              href="/main/products"
              seeAllLabel={t('seeAll')}
            />
          </>
        )}
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
  variant?: 'bestSeller';
}> = ({ title, subtitle, products, href, seeAllLabel, variant }) => {
  if (!products.length) return null;

  const isBestSeller = variant === 'bestSeller';

  return (
    <section className={`space-y-3 sm:space-y-4 ${isBestSeller ? 'rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-3 sm:p-5 shadow-sm' : ''}`}>
      <SectionHeader title={title} subtitle={subtitle} href={href} ctaLabel={seeAllLabel} />
      {isBestSeller && (
        <p className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-orange-700">
          <span aria-hidden>🔥</span> {subtitle}
        </p>
      )}
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
