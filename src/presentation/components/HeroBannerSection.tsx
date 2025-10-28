import React from 'react';
import Image from 'next/image';
import { Banner } from '@/domain/entities/Banner';

const HeroBannerSection: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  if (!banners.length) return null;

  const mainBanner = banners[0];

  return (
    <section className="bg-green-700 text-white p-8 rounded-lg mb-8">
      <div className="flex items-center justify-between">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold mb-4">{mainBanner.title}</h1>
          <p className="text-lg mb-6">{mainBanner.description}</p>
          <button className="px-6 py-3 bg-lime-400 text-green-900 font-semibold rounded-lg hover:bg-lime-300">
            {mainBanner.ctaText}
          </button>
        </div>
        <div className="w-96 h-64">
          <Image
            src={mainBanner.image}
            alt={mainBanner.title}
            width={384}
            height={256}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroBannerSection;