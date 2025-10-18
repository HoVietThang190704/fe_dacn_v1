'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

interface SidebarProps {
  isOpen: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  icon: ReactNode;
  label: string;
  href: string;
  badge?: number;
}

export function Sidebar({ isOpen, isMobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('sidebar');

  const menuItems: MenuItem[] = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: t('home') || 'Trang chủ',
      href: '/main',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      label: t('products') || 'Sản phẩm',
      href: '/main/products',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      label: t('livestream') || 'Livestream',
      href: '/main/livestream',
      badge: 3,
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      label: t('orders') || 'Đơn hàng',
      href: '/main/orders',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      label: t('favorites') || 'Yêu thích',
      href: '/main/favorites',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      label: t('community') || 'Cộng đồng',
      href: '/main/community',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: t('support') || 'Hỗ trợ',
      href: '/main/support',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: t('settings') || 'Cài đặt',
      href: '/main/settings',
    },
  ];
   const normalizePath = (p?: string) => {
    if (!p) return '/';
    return p.replace(/^\/(en|vi)(?=$|\/)/, '') || '/';
  };

  const isActive = (href: string) => {
    const p = normalizePath(pathname);
    if (href === '/main') {
      return p === '/main' || p === '/';
    }
   return p === href || p.startsWith(href + '/');
  };

  // Handle overlay click on mobile
  const handleOverlayClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed top-14 sm:top-16 left-0 right-0 bottom-0 bg-background/80 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
      <aside
        className={`
          ${isMobile ? 'fixed top-14 sm:top-16' : 'sticky top-14 sm:top-16'} left-0 
          ${isMobile ? 'h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]' : 'h-[calc(100vh-4rem)]'}
          bg-sidebar border-r border-sidebar-border shadow-lg md:shadow-none
          z-30 transition-all duration-300 ease-in-out flex-shrink-0
          ${isOpen ? 'translate-x-0 w-64' : isMobile ? '-translate-x-full w-64' : 'w-0 -translate-x-full'}
          overflow-hidden
        `}
      >
        <nav className="h-full overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const active = isActive(item.href);
              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    onClick={() => isMobile && onClose?.()}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-all duration-200 group relative
                      ${
                        active
                          ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary'
                      }
                    `}
                  >
                    <span
                      className={`
                        transition-colors
                        ${active ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-sidebar-primary'}
                      `}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 pt-4 border-t border-sidebar-border px-4">
            <div className="flex items-center gap-3 text-sm text-sidebar-foreground">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-sidebar-foreground">{t('brandName')}</p>
                <p className="text-xs text-muted-foreground">{t('brandSlogan')}</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
