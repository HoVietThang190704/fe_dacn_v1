'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import type { ReactElement, SVGProps } from 'react';
import { PAYMENT_ICONS, SHIPPING_ICONS } from '@/shared/constants/images';

interface LinkItem {
  label: string;
  href: string;
  external?: boolean;
}

interface LogoItem {
  id: string;
  label: string;
  icon?: string;
}

interface SocialLink {
  label: string;
  href: string;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactElement;
}

const IconFacebook = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
    <path
      d="M13.5 21.5v-7h2.3l.4-2.7h-2.7v-1.7c0-.8.3-1.3 1.3-1.3h1.6V6.4a17.2 17.2 0 0 0-2.4-.2c-2.4 0-4 1.4-4 4v2.2H7.7v2.7h2.3v7Z"
      fill="currentColor"
    />
  </svg>
);

const IconInstagram = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
    <path
      d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10a4.5 4.5 0 0 1-4.5 4.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5zm0 1.5A3 3 0 0 0 4 7v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm9.75 2.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25ZM12 7.25A4.75 4.75 0 1 1 7.25 12 4.75 4.75 0 0 1 12 7.25Zm0 1.5A3.25 3.25 0 1 0 15.25 12 3.25 3.25 0 0 0 12 8.75Z"
      fill="currentColor"
    />
  </svg>
);

const IconLinkedIn = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
    <path
      d="M5.5 9h3V21h-3Zm1.5-2.1A1.95 1.95 0 1 1 9 5a1.95 1.95 0 0 1-2 1.9ZM10 9h2.8l.2 1.7a3.55 3.55 0 0 1 3.1-1.9c2.2 0 3.9 1.4 3.9 4.5V21h-3v-6.2c0-1.5-.6-2.3-1.8-2.3-1.1 0-2 .8-2 2.3V21h-3Z"
      fill="currentColor"
    />
  </svg>
);

export function SiteFooter() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const pathname = usePathname();
  const hiddenSegments = ['/livestream', '/auth/login', '/auth/register'];
  const shouldHideFooter = hiddenSegments.some((segment) => pathname?.includes(segment));

  const customerServiceLinks: LinkItem[] = useMemo(
    () => [
      { label: t('sections.customerService.helpCenter'), href: `/${locale}/main/support` },
      { label: t('sections.customerService.blog'), href: 'https://blog.freshmarket.vn', external: true },
      { label: t('sections.customerService.mall'), href: `/${locale}/main/products` },
      { label: t('sections.customerService.buyingGuide'), href: `/${locale}/main/support/buyer-guide` },
      { label: t('sections.customerService.sellingGuide'), href: `/${locale}/main/support/seller-guide` },
      { label: t('sections.customerService.wallet'), href: '#' },
      { label: t('sections.customerService.points'), href: '#' },
      { label: t('sections.customerService.orders'), href: `/${locale}/main/orders` },
      { label: t('sections.customerService.returns'), href: `/${locale}/main/orders` },
      { label: t('sections.customerService.contact'), href: 'mailto:support@freshmarket.vn', external: true },
      { label: t('sections.customerService.warranty'), href: '#' },
    ],
    [locale, t]
  );

  const vietnamLinks: LinkItem[] = useMemo(
    () => [
      { label: t('sections.vietnam.about'), href: `/${locale}/main/about` },
      { label: t('sections.vietnam.careers'), href: '/careers', external: true },
      { label: t('sections.vietnam.terms'), href: '/terms', external: true },
      { label: t('sections.vietnam.privacy'), href: '/privacy', external: true },
      { label: t('sections.vietnam.mall'), href: `/${locale}/main/products` },
      { label: t('sections.vietnam.sellerChannel'), href: `/${locale}/main/users/seller` },
      { label: t('sections.vietnam.flashSale'), href: `/${locale}/main/products?tab=flash-sale` },
      { label: t('sections.vietnam.affiliates'), href: '/affiliates', external: true },
      { label: t('sections.vietnam.media'), href: 'mailto:press@freshmarket.vn', external: true },
    ],
    [locale, t]
  );

  const paymentMethods: LogoItem[] = useMemo(
    () => [
      { id: 'visa', label: t('payment.visa'), icon: PAYMENT_ICONS.VISA },
      { id: 'mastercard', label: t('payment.mastercard'), icon: PAYMENT_ICONS.MASTERCARD },
      { id: 'jcb', label: t('payment.jcb'), icon: PAYMENT_ICONS.JCB },
      { id: 'amex', label: t('payment.amex'), icon: PAYMENT_ICONS.AMEX },
      { id: 'cod', label: t('payment.cod'), icon: PAYMENT_ICONS.COD },
      { id: 'installment', label: t('payment.installment'), icon: PAYMENT_ICONS.INSTALLMENT },
      { id: 'spay', label: t('payment.spay'), icon: PAYMENT_ICONS.SPAY },
    ],
    [t]
  );

  const shippingPartners: LogoItem[] = useMemo(
    () => [
      { id: 'spx', label: t('shipping.spx'), icon: SHIPPING_ICONS.SPX },
      { id: 'ghn', label: t('shipping.ghn'), icon: SHIPPING_ICONS.GHN },
      { id: 'viettel', label: t('shipping.viettel'), icon: SHIPPING_ICONS.VIETTEL },
      { id: 'vnpost', label: t('shipping.vnpost'), icon: SHIPPING_ICONS.VNPOST },
      { id: 'jt', label: t('shipping.jt'), icon: SHIPPING_ICONS.JT_EXPRESS },
      { id: 'grab', label: t('shipping.grab'), icon: SHIPPING_ICONS.GRAB },
      { id: 'ninja', label: t('shipping.ninja'), icon: SHIPPING_ICONS.NINJA },
      { id: 'best', label: t('shipping.best'), icon: SHIPPING_ICONS.BEST },
      { id: 'ahamove', label: t('shipping.ahamove'), icon: SHIPPING_ICONS.AHAMOVE },
    ],
    [t]
  );

  const socialLinks: SocialLink[] = useMemo(
    () => [
      { label: t('follow.facebook'), href: 'https://facebook.com', Icon: IconFacebook },
      { label: t('follow.instagram'), href: 'https://instagram.com', Icon: IconInstagram },
      { label: t('follow.linkedin'), href: 'https://linkedin.com', Icon: IconLinkedIn },
    ],
    [t]
  );

  const appBadges = useMemo(
    () => [
      { id: 'appstore', label: t('download.appStore'), href: '#' },
      { id: 'googleplay', label: t('download.googlePlay'), href: '#' },
      { id: 'appgallery', label: t('download.appGallery'), href: '#' },
    ],
    [t]
  );

  const countries = useMemo(() => t('regions.countries').split('|').map((item) => item.trim()).filter(Boolean), [t]);
  const policies = useMemo(() => t('policiesLine').split('|').map((item) => item.trim()).filter(Boolean), [t]);
  const licenseBadges = useMemo(() => t('licenses').split('|').map((item) => item.trim()).filter(Boolean), [t]);
  const companyLines = useMemo(() => t('company.details').split('\n').map((line) => line.trim()).filter(Boolean), [t]);

  const linkClass = 'text-sm text-gray-600 hover:text-orange-500 transition-colors';

  if (shouldHideFooter) {
    return null;
  }

  const renderLink = (item: LinkItem) => {
    if (item.external) {
      return (
        <a key={item.label} href={item.href} className={linkClass} target="_blank" rel="noreferrer">
          {item.label}
        </a>
      );
    }
    return (
      <Link key={item.label} href={item.href} className={linkClass}>
        {item.label}
      </Link>
    );
  };

  const renderLogoGrid = (title: string, items: LogoItem[]) => (
    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">{title}</p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="flex h-11 items-center justify-center rounded border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-600">
            {item.icon ? (
              <Image src={item.icon} alt={item.label} width={64} height={32} className="h-6 w-auto object-contain" />
            ) : (
              <span>{item.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <footer className="mt-16 border-t bg-[#f7f7f8] text-gray-700">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-800">{t('sections.customerService.title')}</p>
            <div className="mt-4 flex flex-col gap-2">
              {customerServiceLinks.map(renderLink)}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-800">{t('sections.vietnam.title')}</p>
            <div className="mt-4 flex flex-col gap-2">
              {vietnamLinks.map(renderLink)}
            </div>
          </div>

          {renderLogoGrid(t('payment.title'), paymentMethods)}

          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-800">{t('follow.title')}</p>
              <div className="mt-4 flex flex-col gap-2">
                {socialLinks.map((social) => (
                  <a key={social.label} href={social.href} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500" target="_blank" rel="noreferrer">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500">
                      <social.Icon className="h-4 w-4" />
                    </span>
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-800">{t('download.title')}</p>
              <div className="mt-4 flex gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded border border-gray-200 bg-white text-xs font-semibold text-gray-500">
                  {t('download.qrHint')}
                </div>
                <div className="flex flex-col gap-2">
                  {appBadges.map((badge) => (
                    <a key={badge.id} href={badge.href} className="flex items-center justify-center rounded border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:text-orange-500" target="_blank" rel="noreferrer">
                      {badge.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {renderLogoGrid(t('shipping.title'), shippingPartners)}
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">{t('regions.title')}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-gray-500">
              {countries.map((country, index) => (
                <span key={country} className="flex items-center gap-2">
                  {country}
                  {index < countries.length - 1 && <span className="text-gray-400">|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6 text-xs font-semibold text-gray-500">
          {policies.map((policy, index) => (
            <span key={policy} className="flex items-center gap-3">
              {policy}
              {index < policies.length - 1 && <span className="text-gray-300">|</span>}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {licenseBadges.map((badge) => (
            <div key={badge} className="flex items-center gap-2 rounded border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600">
              <span className="h-5 w-5 rounded-full bg-orange-500/80" aria-hidden />
              {badge}
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          {companyLines.map((line) => (
            <p key={line} className="mb-1">
              {line}
            </p>
          ))}
        </div>
      </div>
    </footer>
  );
}
