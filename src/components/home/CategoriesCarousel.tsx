"use client"

import React from 'react'
import Image from 'next/image'
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
    <div className="bg-white shadow-sm p-3 mb-3">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const src = slugToIcon[category.slug || ''] ?? category.icon ?? ICONS.GOODS

          return (
            <div
              key={category.id}
              className="flex flex-col items-center min-w-[70px] cursor-pointer"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-1">
                <Image src={src} alt={category.name} width={28} height={28} className="w-7 h-7" />
              </div>
              <span className="text-xs text-center">{category.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
