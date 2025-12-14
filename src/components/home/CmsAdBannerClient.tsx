"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

const AUTOPLAY_MS = 5000;

const CmsAdBannerClient: React.FC<{ banners: CmsAdBannerData[] }> = ({ banners }) => {
  const safeBanners = useMemo(() => (Array.isArray(banners) ? banners.filter(Boolean) : []), [banners]);
  const canNavigate = safeBanners.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= safeBanners.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, safeBanners.length]);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (!safeBanners.length) return;
      const normalized = ((nextIndex % safeBanners.length) + safeBanners.length) % safeBanners.length;
      setActiveIndex(normalized);
    },
    [safeBanners.length]
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  const activeBanner = safeBanners[activeIndex];
  const autoplayEnabled = canNavigate && activeBanner?.mediaType !== 'video';

  useEffect(() => {
    if (!autoplayEnabled) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => ((prev + 1) % safeBanners.length));
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplayEnabled, safeBanners.length]);

  const renderMedia = (banner: CmsAdBannerData) => {
    if (!banner.media) return null;

    if (banner.mediaType === 'video') {
      return (
        <video className="w-full h-auto" controls>
          <source src={banner.media} />
          Your browser does not support the video tag.
        </video>
      );
    }

    return (
      <div className="relative w-full h-[200px] sm:h-[240px] md:h-[300px]">
        <Image src={banner.media} alt={banner.title} fill className="object-cover" />
      </div>
    );
  };

  return (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-white p-0 sm:p-0 shadow-md">
        <div className="container mx-auto">
          {!safeBanners.length ? null : (
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {safeBanners.map((banner) => {
                    const isExternal = banner.ctaLink ? banner.ctaLink.startsWith('http') : false;
                    const mediaNode = banner.media ? renderMedia(banner) : null;

                    return (
                      <div key={banner.id} className="w-full shrink-0">
                        {mediaNode ? (
                          <div className="w-full">
                            {banner.ctaLink ? (
                              isExternal ? (
                                <a href={banner.ctaLink} target="_blank" rel="noreferrer" className="block">
                                  {mediaNode}
                                </a>
                              ) : (
                                <Link href={banner.ctaLink} className="block">
                                  {mediaNode}
                                </Link>
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
                              <a
                                href={banner.ctaLink}
                                target={isExternal ? '_blank' : undefined}
                                rel={isExternal ? 'noreferrer' : undefined}
                                className="inline-block mt-3 bg-white/90 text-emerald-800 px-4 py-2 rounded-md text-sm font-medium"
                              >
                                {banner.ctaText}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {canNavigate && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous banner"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 text-white w-9 h-9 flex items-center justify-center backdrop-blur-sm hover:bg-black/40"
                  >
                    <span aria-hidden className="text-lg leading-none">&lt;</span>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next banner"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 text-white w-9 h-9 flex items-center justify-center backdrop-blur-sm hover:bg-black/40"
                  >
                    <span aria-hidden className="text-lg leading-none">&gt;</span>
                  </button>

                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
                    {safeBanners.map((banner, idx) => (
                      <button
                        key={banner.id}
                        type="button"
                        onClick={() => goTo(idx)}
                        aria-label={`Go to banner ${idx + 1}`}
                        className={
                          idx === activeIndex
                            ? 'h-2.5 w-2.5 rounded-full bg-white'
                            : 'h-2.5 w-2.5 rounded-full bg-white/50 hover:bg-white/70'
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CmsAdBannerClient;
