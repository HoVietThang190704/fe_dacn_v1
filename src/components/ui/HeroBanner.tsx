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
        <div className="relative w-full min-h-[300px] md:min-h-[400px] overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700">
            <div className="relative z-10 h-full flex items-center min-h-[300px] md:min-h-[400px]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="text-white pb-10 md:pb-14">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                                {t('title')}
                            </h1>
                            <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                                {t('description')}
                            </p>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={onShopNowClick}
                                className="bg-lime-400 hover:bg-lime-300 text-emerald-900 transition-all duration-300 transform hover:scale-105"
                            >
                                {t('shopNow')}
                            </Button>
                        </div>
                        
                        <div className="flex justify-center lg:justify-end">
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

            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
                <svg
                    className="relative block w-full h-20"
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