'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/hooks/useAuth';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('navbar');

  return (
    <div className="relative flex-1 max-w-2xl mx-4">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <Link href="/cart" className="relative p-2 text-white hover:text-gray-200 transition-colors">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.3 4.7H20M7 13v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
      </svg>
      {cartItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
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
        className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
      >
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-teal-600 font-semibold text-sm">
            {user?.userName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 text-sm text-gray-700 border-b">
            <div className="font-semibold">{user?.userName || 'User'}</div>
            <div className="text-gray-500">{user?.email}</div>
          </div>
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            {t('profile')}
          </Link>
          <Link 
            href="/orders" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            {t('orders')}
          </Link>
          <Link 
            href="/settings" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setShowDropdown(false)}
          >
            {t('settings')}
          </Link>
          <button
            onClick={() => {
              logout();
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
};

export default function Navbar() {
  const t = useTranslations('navbar');
  
  return (
    <nav className="bg-teal-600 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/main" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-teal-600 font-bold text-lg">🛒</span>
              </div>
              <span className="text-xl font-bold">Fresh Market</span>
            </Link>
          </div>
          <SearchBar />
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-orange-500 px-3 py-1 rounded-full text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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