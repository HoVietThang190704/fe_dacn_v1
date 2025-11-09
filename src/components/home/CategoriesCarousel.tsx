"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ICONS } from '@/shared/constants/images'

type Category = {
  id: string
  name: string
  icon?: string
  slug?: string
}

export default function CategoriesCarousel({ categories }: { categories: Category[] }) {
  const slugToIcon: Record<string, string> = {
    'rau-cu': ICONS.VEGETABLE,
    'trai-cay': ICONS.FRUITS,
  }

  return (
    <section className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Danh mục sản phẩm</h2>
      
      {/* Grid layout - tự động xuống hàng, responsive */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 sm:gap-4">
        {categories.map((category) => {
          const src = slugToIcon[category.slug || ''] ?? category.icon ?? ICONS.GOODS

          return (
            <Link
              key={category.id}
              href={`/main/products?category=${category.slug || category.id}`}
              className="flex flex-col items-center group"
            >
              {/* Icon container với hover effect */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center mb-2 transition-all duration-200 group-hover:shadow-md group-hover:scale-105 group-hover:from-orange-100 group-hover:to-orange-200">
                <Image 
                  src={src} 
                  alt={category.name} 
                  width={32} 
                  height={32} 
                  className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-110" 
                />
              </div>
              
              {/* Category name - line-clamp để tránh quá dài */}
              <span className="text-xs sm:text-sm text-center text-gray-700 group-hover:text-orange-600 transition-colors line-clamp-2 w-full px-1">
                {category.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
