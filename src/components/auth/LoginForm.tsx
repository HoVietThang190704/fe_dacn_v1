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
  AuthLink 
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
    <div className="min-h-screen flex bg-[var(--background)] font-[var(--font-sans)] relative">
      <div className="fixed inset-0 z-0">
        <Image
          src="/img/background.png"
          alt="Login Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/50 backdrop-blur-sm p-8 rounded-[var(--radius)] shadow-[var(--shadow)] w-full max-w-md z-10">
        <h1 className="text-center text-2xl font-bold mb-6 text-[var(--foreground)]">
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
            className="w-full"
          >
            {t('login.submit')}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link href="/auth/forgot-password" className="text-[var(--primary)] text-sm hover:underline">
            {t('login.forgotPassword')}
          </Link>
        </div>

        <AuthDivider text={t('social.orLoginWith')} />

        <div className="grid grid-cols-2 gap-3">
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
          className="mt-4"
        />
      </div>
    </div>
  );
}