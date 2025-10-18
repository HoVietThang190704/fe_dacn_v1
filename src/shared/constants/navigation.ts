/**
 * Navigation Constants
 * Centralized navigation menu configuration
 */
export interface NavigationItem {
  id: string;
  labelKey: string; // i18n key
  icon: string;
  path: string;
  badge?: number;
  children?: NavigationItem[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    labelKey: 'nav.home',
    icon: 'home',
    path: '/main',
  },
  {
    id: 'products',
    labelKey: 'nav.products',
    icon: 'shopping-bag',
    path: '/main/products',
  },
  {
    id: 'livestream',
    labelKey: 'nav.livestream',
    icon: 'video',
    path: '/main/livestream',
    badge: 3,
  },
  {
    id: 'orders',
    labelKey: 'nav.orders',
    icon: 'package',
    path: '/main/orders',
  },
  {
    id: 'favorites',
    labelKey: 'nav.favorites',
    icon: 'heart',
    path: '/main/favorites',
  },
  {
    id: 'community',
    labelKey: 'nav.community',
    icon: 'users',
    path: '/main/community',
  },
  {
    id: 'support',
    labelKey: 'nav.support',
    icon: 'help-circle',
    path: '/main/support',
  },
  {
    id: 'settings',
    labelKey: 'nav.settings',
    icon: 'settings',
    path: '/main/settings',
  },
];
