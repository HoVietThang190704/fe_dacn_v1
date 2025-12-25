"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { ProductCategory } from '@/domain/entities/Product';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { CATEGORY_ICONS } from '@/shared/constants/categoryIcons';

interface Props {
  categories: ProductCategory[];
  selectedCategory?: string;
  onCategoryChange: (categoryId: string) => void;
}

const CategoryFilter: React.FC<Props> = ({ categories, selectedCategory = '', onCategoryChange }) => {
  const t = useTranslations('products');
  // Use home translations for section labels (show more / collapse), it contains the section text we reuse
  const thome = useTranslations('home');
  const [expanded, setExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const maxItemsPerView = useMemo(() => {
    if (windowWidth >= 1280) return 20; // xl: 10 cols × 2 rows
    if (windowWidth >= 1024) return 16; // lg: 8 cols × 2 rows
    if (windowWidth >= 768) return 12;  // md: 6 cols × 2 rows
    if (windowWidth >= 640) return 10;  // sm: 5 cols × 2 rows
    return 8; // mobile: 4 cols × 2 rows
  }, [windowWidth]);

  const availableSlots = Math.max(0, maxItemsPerView - 1); // reserve 1 slot for 'All' tile
  const hasMoreCategories = categories.length > availableSlots;

  // Show threshold from the grid and allow expand/collapse
  const visibleCategories = useMemo(() => {
    if (expanded) return categories;
    const reserved = hasMoreCategories ? 1 : 0; // reserve slot for show-more tile
    const visibleCount = Math.max(0, availableSlots - reserved);
    const base = categories.slice(0, visibleCount);

    // Ensure selected category is visible. If a non-empty selected category exists and it's not in `base`,
    // replace the last slot with the selected one so it remains visible.
    if (selectedCategory && !base.some((c) => c.id === selectedCategory)) {
      const selected = categories.find((c) => c.id === selectedCategory);
      if (selected) {
        // Remove last if base is full, put selected at the end to be visible
        const replaced = [...base];
        if (replaced.length > 0) replaced[replaced.length - 1] = selected;
        else replaced.push(selected);
        return replaced;
      }
    }

    return base;
  }, [categories, expanded, selectedCategory, hasMoreCategories, availableSlots]);

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 sm:p-4 border border-gray-100">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('filterByCategory')}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
        <button
          key="all"
          onClick={() => onCategoryChange('')}
          className={`flex flex-col items-center group select-none focus:outline-none ${selectedCategory === '' ? '' : ''}`}
          aria-pressed={selectedCategory === ''}
          title={t('allCategories')}
        >
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 transition-all duration-200 ${
              selectedCategory === ''
                ? 'bg-gradient-to-br from-green-200 to-green-200 text-white shadow-md'
                : 'bg-gradient-to-br from-green-200 to-green-200 text-gray-600 hover:shadow-md hover:from-green-100 hover:to-green-200'
            }`}
          >
            {ICONS.CHECK ? (
              <Image src={ICONS.CHECK} alt={String(t('allCategories'))} width={20} height={20} className="w-4 h-4" unoptimized />
            ) : null}
          </div>
          <span className={`text-xs sm:text-sm text-center ${selectedCategory === '' ? 'text-gray-700 font-semibold' : 'text-gray-700'} transition-colors w-full px-1 line-clamp-2`}>{t('allCategories')}</span>
        </button>

        {visibleCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className="flex flex-col items-center group select-none focus:outline-none"
            aria-pressed={selectedCategory === category.id}
            title={category.name}
          >
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 transition-all duration-200 group-hover:shadow-md group-hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-br from-green-200 to-green-200 text-white shadow-md'
                  : 'bg-gradient-to-br from-green-50 to-green-100 text-green-300 hover:from-green-100 hover:to-green-200'
              }`}
            >
              {(() => {
                const candidate = CATEGORY_ICONS[category.slug ?? ''] ?? category.icon ?? ICONS.GOODS
                const isImage = typeof candidate === 'string' && (candidate.startsWith('/') || candidate.startsWith('http') || candidate.startsWith('data:') || /\.(png|jpe?g|svg|gif|webp)(\?.*)?$/.test(candidate))
                return isImage ? (
                  <Image src={candidate as string} alt={category.name} width={32} height={32} className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform ${selectedCategory === category.id ? 'group-hover:scale-110' : 'group-hover:scale-110'}`} unoptimized/>
                ) : (
                  <span className="text-2xl">{candidate}</span>
                )
              })()} 
            </div>
            <span className={`text-xs sm:text-sm text-center transition-colors w-full px-1 ${selectedCategory === category.id ? 'text-gray-700 font-semibold' : 'text-gray-700'} line-clamp-2`}>{category.name}</span>
          </button>
        ))}
        {hasMoreCategories ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex flex-col items-center group cursor-pointer"
            aria-expanded={expanded}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-2 transition-all duration-200 group-hover:shadow-md group-hover:scale-105 group-hover:from-gray-100 group-hover:to-gray-200">
              <svg 
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm text-center text-gray-700 group-hover:text-orange-600 transition-colors line-clamp-2 w-full px-1">
              {expanded ? thome('sections.categories.collapse') : thome('sections.categories.showMore', { count: categories.length - visibleCategories.length })}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default CategoryFilter;
