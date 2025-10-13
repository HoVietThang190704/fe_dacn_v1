'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/hooks/useAuth';

interface UserDropdownProps {
  className?: string;
}

export const UserDropdown = ({ className = '' }: UserDropdownProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const t = useTranslations('navbar');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };
  const renderLoggedInDropdown = () => (
    <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-50 border border-border">
      <div className="px-4 py-2 text-sm text-popover-foreground border-b border-border">
        <div className="font-semibold">{user?.userName || 'User'}</div>
        <div className="text-muted-foreground text-xs truncate">{user?.email}</div>
      </div>
      
      <Link 
        href="/profile" 
        className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={closeDropdown}
      >
        {t('profile')}
      </Link>
      
      <Link 
        href="/orders" 
        className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={closeDropdown}
      >
        {t('orders')}
      </Link>
      
      <Link 
        href="/settings" 
        className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        onClick={closeDropdown}
      >
        {t('settings')}
      </Link>
      
      <button
        onClick={handleLogout}
        className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
      >
        {t('logout')}
      </button>
    </div>
  );

  const renderGuestDropdown = () => (
    <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-2 z-50 border border-border">
      <div className="px-4 py-2 text-sm text-popover-foreground border-b border-border">
        <div className="font-semibold">{t('welcome')}</div>
        <div className="text-muted-foreground text-xs">{t('pleaseSignIn')}</div>
      </div>
      
      <Link 
        href="/auth/login" 
        className="block mx-3 my-2 px-4 py-2 text-sm text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
        onClick={closeDropdown}
      >
        {t('login') || 'Sign In'}
      </Link>
      
      <Link 
        href="/auth/register" 
        className="block mx-3 mb-2 px-4 py-2 text-sm text-center bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors font-medium"
        onClick={closeDropdown}
      >
        {t('register') || 'Sign Up'}
      </Link>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-navbar-foreground hover:text-navbar-foreground/80 transition-colors p-1"
        aria-label="User menu"
        aria-expanded={showDropdown}
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-card rounded-full flex items-center justify-center">
          <span className="text-primary font-semibold text-xs sm:text-sm">
            {user?.userName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      </button>

      {showDropdown && (
        user ? renderLoggedInDropdown() : renderGuestDropdown()
      )}
    </div>
  );
};
