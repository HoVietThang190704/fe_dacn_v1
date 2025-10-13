'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/hooks/useAuth';
import { MenuButton } from '@/components/ui';
import { Sidebar } from './Sidebar';
import Image from 'next/image';
const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('navbar');

  return (
    <div className="relative flex-1 max-w-3xl mx-2 sm:mx-4 md:mx-6">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base text-foreground bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const CartIcon = () => {
  const [cartItems] = useState(3); 
  const t = useTranslations('navbar');

  return (
    <Link href="/cart" className="relative p-1.5 sm:p-2 text-navbar-foreground hover:text-navbar-foreground/80 transition-colors">
      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.3 4.7H20M7 13v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
      </svg>
      {cartItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-destructive text-destructive-foreground text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
          {cartItems}
        </span>
      )}
    </Link>
  );
};

const UserAvatar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const t = useTranslations('navbar');

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-navbar-foreground hover:text-navbar-foreground/80 transition-colors p-1"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-card rounded-full flex items-center justify-center">
          <span className="text-primary font-semibold text-xs sm:text-sm">
            {user?.userName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-50 border border-border">
          <div className="px-4 py-2 text-sm text-popover-foreground border-b border-border">
            <div className="font-semibold">{user?.userName || 'User'}</div>
            <div className="text-muted-foreground">{user?.email}</div>
          </div>
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => setShowDropdown(false)}
          >
            {t('profile')}
          </Link>
          <Link 
            href="/orders" 
            className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => setShowDropdown(false)}
          >
            {t('orders')}
          </Link>
          <Link 
            href="/settings" 
            className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => setShowDropdown(false)}
          >
            {t('settings')}
          </Link>
          <button
            onClick={() => {
              logout();
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
};

interface NavbarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const t = useTranslations('navbar');
  
  const handleMenuToggle = (isOpen: boolean) => {
    onMenuToggle?.(isOpen);
  };
  
  return (
    <nav className="bg-navbar text-navbar-foreground shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-2 md:gap-4">
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 min-w-fit">
            <MenuButton onToggle={handleMenuToggle} />
            <Link href="/main" className="flex items-center space-x-1 sm:space-x-2">
              <Image 
                src="/img/logo.png" 
                alt="Logo" 
                width={80} 
                height={50} 
                className="object-contain w-16 h-24 sm:w-18 sm:h-26 md:w-20 md:h-[80px]" 
              />
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold whitespace-nowrap hidden sm:inline">
                Fresh Market
              </span>
            </Link>
          </div>
          <SearchBar />
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 min-w-fit">
            <div className="hidden lg:flex items-center space-x-2 bg-orange-500 px-3 xl:px-4 py-1.5 xl:py-2 rounded-full text-xs xl:text-sm whitespace-nowrap">
              <svg className="w-3.5 h-3.5 xl:w-4 xl:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{t('deliveryPromise')}</span>
            </div>
            <CartIcon />
            <UserAvatar />
          </div>
        </div>
      </div>
    </nav>
  );
}