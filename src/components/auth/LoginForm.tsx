'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/hooks/useAuth';
import { validateEmail } from '@/lib/validation';
import { 
  Input, 
  Button, 
  PasswordInput, 
  GoogleSignInButton,
  FacebookSignInButton, 
  AuthDivider, 
  AuthLink,
  PageLoader 
} from '@/components/ui';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const t = useTranslations('auth');

  const loginWithFacebook = async () => {
    console.log('Facebook login clicked - not implemented yet');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!email) {
      errors.email = t('validation.emailRequired');
    } else if (!validateEmail(email)) {
      errors.email = t('validation.emailInvalid');
    }
    
    if (!password) {
      errors.password = t('validation.passwordRequired');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await login({ email, password });
  };

  return (
    <>
      <PageLoader />
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] font-[var(--font-sans)] relative p-4 sm:p-6 md:p-8">
        <div className="fixed inset-0 z-0">
        <Image
          src="/img/Background1.PNG"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      <Link 
        href="/" 
        className="absolute top-3 left-3 sm:top-6 sm:left-6 z-30 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-white/40 hover:bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-gray-700 hover:text-gray-600 group"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="hidden sm:inline text-sm font-medium">{t('backToHome')}</span>
      </Link>
      <div className="relative z-10 bg-white/40 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-[var(--shadow)] w-full max-w-[95%] sm:max-w-md">
        <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-[var(--foreground)]">
          {t('login.title')}
        </h1>
        
        {error && (
          <div className="text-[var(--destructive)] mb-4 text-center text-sm bg-white-50 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label={t('login.email')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationErrors.email) {
                setValidationErrors(prev => ({ ...prev, email: '' }));
              }
            }}
            placeholder={t('login.email')}
            disabled={isLoading}
            error={validationErrors.email}
          />

          <PasswordInput
            label={t('login.password')}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationErrors.password) {
                setValidationErrors(prev => ({ ...prev, password: '' }));
              }
            }}
            placeholder={t('login.password')}
            disabled={isLoading}
            error={validationErrors.password}
            autoComplete="new-password"
            data-testid="password-input"
          />

          <Button 
            type="submit"
            isLoading={isLoading}
            className="w-full "
          >
            {t('login.submit')}
          </Button>
        </form>

        <div className="text-center mt-3 sm:mt-4">
          <Link 
            href="/auth/forgot-password" 
            className="text-[var(--shadow-color)] text-xs sm:text-sm hover:underline transition-colors"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>

        <AuthDivider text={t('social.orLoginWith')} />

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <GoogleSignInButton 
            onClick={loginWithGoogle}
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full"
          />
          <FacebookSignInButton 
            onClick={loginWithFacebook}
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full"
          />
        </div>

        <AuthLink 
          href="/auth/register"
          text={t('login.noAccount')}
          linkText={t('login.createAccount')}
          className="mt-3 sm:mt-4 text-xs sm:text-sm"
        />
      </div>
    </div>
    </>
  );
}