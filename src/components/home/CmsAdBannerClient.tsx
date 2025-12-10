"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Skeleton from '@/components/ui/skeleton';

export interface CmsAdBannerData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  media?: string | null;
  mediaType?: 'image' | 'video' | 'unknown' | null;
  ctaText?: string;
  ctaLink?: string;
  backgroundGradient?: string;
}

const CmsAdBannerClient: React.FC<{ banner: CmsAdBannerData | null }> = ({ banner }) => {
  if (!banner) return null;

  const isExternal = banner.ctaLink ? banner.ctaLink.startsWith('http') : false;

  const mediaNode = banner.mediaType === 'video' ? (
    <video className="w-full h-auto" controls>
      <source src={banner.media!} />
      Your browser does not support the video tag.
    </video>
  ) : (
    <div className="relative w-full h-[200px] sm:h-[240px] md:h-[300px]">
      <Image src={banner.media!} alt={banner.title} fill className="object-cover" />
    </div>
  );

  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white p-0 sm:p-0 shadow-md">
        <div className="container mx-auto">
          {banner.media ? (
            <div className="w-full">
              {banner.ctaLink ? (
                isExternal ? (
                  <a href={banner.ctaLink} target="_blank" rel="noreferrer" className="block">{mediaNode}</a>
                ) : (
                  <Link href={banner.ctaLink} className="block">{mediaNode}</Link>
                )
              ) : (
                mediaNode
              )}
            </div>
          ) : (
            <div className="p-4 bg-emerald-600 text-white">
              {banner.subtitle && <p className="text-xs uppercase tracking-wide">{banner.subtitle}</p>}
              <h3 className="text-lg font-semibold mt-1">{banner.title}</h3>
              {banner.description && <p className="text-sm mt-2">{banner.description}</p>}
              {banner.ctaText && banner.ctaLink && (
                <a href={banner.ctaLink} className="inline-block mt-3 bg-white/90 text-emerald-800 px-4 py-2 rounded-md text-sm font-medium">{banner.ctaText}</a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CmsAdBannerClient;
