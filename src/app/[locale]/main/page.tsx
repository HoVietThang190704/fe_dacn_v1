'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/hooks/useAuth';
import { HeroBanner } from '@/components/ui';
import Link from 'next/link';

export default function MainPage() {
  const t = useTranslations('main');
  const { isAuthenticated, isLoading } = useAuth();

  const handleShopNowClick = () => {
    if (isAuthenticated) {
      // Scroll xuống phần dashboard hoặc products
      const dashboardSection = document.getElementById('dashboard');
      if (dashboardSection) {
        dashboardSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Redirect đến trang đăng nhập
      window.location.href = '/auth/login';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Component cho guest user
  const GuestContent = () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {t('guestWelcome')}
      </h2>
      <p className="text-gray-600 mb-6">
        {t('guestDescription')}
      </p>
      <div className="space-x-4">
        <Link 
          href="/auth/login"
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
        >
          {t('loginButton')}
        </Link>
        <Link 
          href="/auth/register"
          className="border border-teal-600 text-teal-600 px-6 py-3 rounded-lg hover:bg-teal-50 transition-colors"
        >
          {t('registerButton')}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="mb-8">
        <HeroBanner onShopNowClick={handleShopNowClick} />
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="dashboard">
        {!isAuthenticated ? (
          <GuestContent />
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('products')}
                </h2>
                <p className="text-gray-600">{t('manageProducts')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('orders')}
                </h2>
                <p className="text-gray-600">{t('manageOrders')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('profile')}
                </h2>
                <p className="text-gray-600">{t('manageProfile')}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Welcome Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('welcomeTitle')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('welcomeDescription')}
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-600">{t('totalProducts')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-600">{t('totalOrders')}</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-600">{t('totalRevenue')}</div>
            </div>
          </div>
        </div>
        </>
      )}
      </div>
    </div>
  );
}