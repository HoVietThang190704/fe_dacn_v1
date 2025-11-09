'use client';

import Image from "next/image";
import { Button } from "@/components/ui";
import { useTranslations } from "next-intl";

interface HeroBannerProps {
    onShopNowClick: () => void;
}

export function HeroBanner ({onShopNowClick}: HeroBannerProps) {
    const t = useTranslations('heroSide');
    return (
        <div className="relative w-full min-h-[280px] sm:min-h-[320px] md:min-h-[400px] overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg">
            <div className="relative z-10 h-full flex items-center min-h-[280px] sm:min-h-[320px] md:min-h-[400px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                        <div className="text-white pb-8 sm:pb-10 md:pb-14 pt-4 sm:pt-6">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                                {t('title')}
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-4 sm:mb-6 leading-relaxed line-clamp-3">
                                {t('description')}
                            </p>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={onShopNowClick}
                                className="bg-lime-400 hover:bg-lime-300 text-emerald-900 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                            >
                                {t('shopNow')}
                            </Button>
                        </div>
                        
                        <div className="hidden lg:flex justify-center lg:justify-end">
                            <div className="relative w-[280px] h-[200px] md:w-[350px] md:h-[250px] lg:w-[400px] lg:h-[280px]">
                                <Image
                                    src="/img/HeroBanner.png"
                                    alt="Fresh groceries basket"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wave decoration - ẩn trên mobile nhỏ */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none hidden sm:block">
                <svg
                    className="relative block w-full h-12 sm:h-16 md:h-20"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,0 C300,60 900,60 1200,0 V120 H0 Z"
                        className="fill-white"
                    ></path>
                </svg>
            </div>
        </div>
    );
}