'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
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
      icon: <Image src={ICONS.HOME} alt="home" width={20} height={20} className="w-5 h-5" />,
      label: t('home') || 'Trang chủ',
      href: '/main',
    },
    {
      icon: <Image src={ICONS.GOODS || ICONS.SHOPPING_CART} alt="products" width={20} height={20} className="w-5 h-5" />,
      label: t('products') || 'Sản phẩm',
      href: '/main/products',
    },
    {
      icon: <Image src={ICONS.VIDEO_CAMERA_ALT} alt="livestream" width={20} height={20} className="w-5 h-5" />,
      label: t('livestream') || 'Livestream',
      href: '/main/livestream',
      badge: 3,
    },
    {
      icon: <Image src={ICONS.SHOPPING_CART} alt="orders" width={20} height={20} className="w-5 h-5" />,
      label: t('orders') || 'Đơn hàng',
      href: '/main/orders',
    },
    {
      icon: <Image src={ICONS.HEART} alt="favorites" width={20} height={20} className="w-5 h-5" />,
      label: t('favorites') || 'Yêu thích',
      href: '/main/favorites',
    },
    {
      icon: <Image src={ICONS.USERS} alt="community" width={20} height={20} className="w-5 h-5" />,
      label: t('community') || 'Cộng đồng',
      href: '/main/community',
    },
    {
      icon: <Image src={ICONS.QUESTION} alt="support" width={20} height={20} className="w-5 h-5" />,
      label: t('support') || 'Hỗ trợ',
      href: '/main/support',
    },
    {
      icon: <Image src={ICONS.SETTINGS} alt="settings" width={20} height={20} className="w-5 h-5" />,
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
              <Image
                src={ICONS.YES}
                alt="verified"
                width={20}
                height={20}
                className="w-5 h-5"
              />
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
