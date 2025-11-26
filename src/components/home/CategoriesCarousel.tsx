"use client"

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ICONS } from '@/shared/constants/images'
import { useTranslations } from 'next-intl'

type Category = {
  id: string
  name: string
  icon?: string
  slug?: string
}

export default function CategoriesCarousel({ categories }: { categories: Category[] }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi'
  const t = useTranslations('home')
  const [isExpanded, setIsExpanded] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)

  const slugToIcon: Record<string, string> = {
    'rau-cu': ICONS.VEGETABLE,
    'trai-cay': ICONS.FRUITS,
    'rau_cu_qua': ICONS.RAU_CU_QUA,
    'rau-la': ICONS.LEAFY_VEGETABLES,
    'xa-lach-lo-lo': ICONS.ICEBERG_LETTUCE,
    'san-pham-huu-co': ICONS.ORGANIC_PRODUCTS,
    'sua': ICONS.MILK,
    'eggs': ICONS.EGGS,
    'rau-mam-hon-hop': ICONS.MIXED_SPROUTS,
    'gao': ICONS.RICE,
    'chuoi-gia': ICONS.RIPE_BANANA,
    'hai-san': ICONS.SEAFOOD,
    'cu-goc': ICONS.ROOT_VEGETABLES,
    'rau-thom-gia-vi': ICONS.HERBS_SPICES,
    'ngu-coc': ICONS.GRAINS,
    'thit': ICONS.MEAT,
    'ca-chua-bi': ICONS.CHERRY_TOMATO
  }

  // Update window width on mount and resize
  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth)
    updateWidth() // Set initial width
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Calculate max items for 2 rows based on screen size
  const maxItemsPerView = useMemo(() => {
    if (windowWidth >= 1280) return 20 // xl: 10 cols × 2 rows
    if (windowWidth >= 1024) return 16 // lg: 8 cols × 2 rows
    if (windowWidth >= 768) return 12 // md: 6 cols × 2 rows
    if (windowWidth >= 640) return 10 // sm: 5 cols × 2 rows
    return 8 // mobile: 4 cols × 2 rows
  }, [windowWidth])

  const hasMoreCategories = categories.length > maxItemsPerView
  const displayedCategories = isExpanded ? categories : categories.slice(0, hasMoreCategories ? maxItemsPerView - 1 : maxItemsPerView)
  const shouldShowButton = hasMoreCategories

  return (
    <section className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{t('sections.categories.title')}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
        {displayedCategories.map((category) => {
          const src = slugToIcon[category.slug || ''] ?? category.icon ?? ICONS.GOODS

          return (
            <Link
                key={category.id}
                href={`/${locale}/main/search?q=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center group"
              >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mb-2 transition-all duration-200 group-hover:shadow-md group-hover:scale-105 group-hover:from-orange-100 group-hover:to-orange-200">
                <Image 
                  src={src} 
                  alt={category.name} 
                  width={32} 
                  height={32} 
                  className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110" 
                />
              </div>
              <span className="text-xs sm:text-sm text-center text-gray-700 group-hover:text-orange-600 transition-colors line-clamp-2 w-full px-1">
                  {category.name}
                </span>
            </Link>
          )
        })}
        
        {shouldShowButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-2 transition-all duration-200 group-hover:shadow-md group-hover:scale-105 group-hover:from-gray-100 group-hover:to-gray-200">
              <svg 
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <span className="text-xs sm:text-sm text-center text-gray-700 group-hover:text-orange-600 transition-colors line-clamp-2 w-full px-1">
              {isExpanded ? t('sections.categories.collapse') : t('sections.categories.showMore', { count: categories.length - maxItemsPerView })}
            </span>
          </button>
        )}
      </div>
    </section>
  )
}
