'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { authAPI } from '@/lib/api';
import { validateEmail } from '@/lib/validation';
import { Button, Input, PageLoader, PasswordInput } from '@/components/ui';

type Step = 'request' | 'verify' | 'success';

type FieldKey = 'email' | 'otp' | 'newPassword' | 'confirmPassword';

export default function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<FieldKey, string>>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const formattedExpiry = useMemo(() => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [expiresAt]);

  const clearFieldError = (field: FieldKey) => {
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateRequestForm = () => {
    const errors: Record<FieldKey, string> = { email: '', otp: '', newPassword: '', confirmPassword: '' };

    if (!email.trim()) {
      errors.email = t('validation.emailRequired');
    } else if (!validateEmail(email.trim())) {
      errors.email = t('validation.emailInvalid');
    }

    setValidationErrors(errors);
    return !errors.email;
  };

  const validateResetForm = () => {
    const errors: Record<FieldKey, string> = { email: '', otp: '', newPassword: '', confirmPassword: '' };
    const sanitizedOtp = otp.trim();

    if (!sanitizedOtp) {
      errors.otp = t('validation.otpRequired');
    } else if (sanitizedOtp.length !== 6) {
      errors.otp = t('validation.otpInvalid');
    }

    if (!newPassword) {
      errors.newPassword = t('validation.passwordRequired');
    } else if (newPassword.length < 6) {
      errors.newPassword = t('validation.passwordMinLength');
    }

    if (!confirmPassword) {
      errors.confirmPassword = t('validation.confirmPasswordRequired');
    } else if (confirmPassword !== newPassword) {
      errors.confirmPassword = t('validation.passwordMismatch');
    }

    setValidationErrors(errors);
    return !errors.otp && !errors.newPassword && !errors.confirmPassword;
  };

  const handleRequestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError('');
    setInfoMessage(null);

    if (!validateRequestForm()) return;

    const normalizedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      const response = await authAPI.forgotPassword(normalizedEmail);
      if (response.success && response.data) {
        const payload = response.data;
        if (payload.success === false) {
          setGeneralError(payload.message || t('forgot.genericError'));
        } else {
          setEmail(normalizedEmail);
          setStep('verify');
          setInfoMessage(payload.message || t('forgot.otpSent', { email: normalizedEmail }));
          setExpiresAt(payload.expiresAt || null);
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setValidationErrors({ email: '', otp: '', newPassword: '', confirmPassword: '' });
        }
      } else {
        setGeneralError(response.error || t('forgot.genericError'));
      }
    } catch (error) {
      console.error('Forgot password request error:', error);
      setGeneralError(t('forgot.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError('');
    setInfoMessage(null);

    if (!validateResetForm()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const sanitizedOtp = otp.trim();
    setIsSubmitting(true);

    try {
      const response = await authAPI.resetPasswordWithOtp({
        email: normalizedEmail,
        otp: sanitizedOtp,
        newPassword
      });

      if (response.success && response.data) {
        const payload = response.data;
        if (payload.success === false) {
          setGeneralError(payload.message || t('forgot.genericError'));
        } else {
          setStep('success');
          setInfoMessage(payload.message || t('forgot.successDescription'));
        }
      } else {
        setGeneralError(response.error || t('forgot.genericError'));
      }
    } catch (error) {
      console.error('Reset password via OTP error:', error);
      setGeneralError(t('forgot.genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    if (step === 'success') {
      return (
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold text-[var(--foreground)]">{t('forgot.successTitle')}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{infoMessage || t('forgot.successDescription')}</p>
          <Button type="button" className="w-full" onClick={() => router.push('/auth/login')}>
            {t('forgot.backToLogin')}
          </Button>
        </div>
      );
    }

    const onSubmit = step === 'request' ? handleRequestOtp : handleResetPassword;

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="email"
          label={t('forgot.emailLabel')}
          value={email}
          disabled={step === 'verify'}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFieldError('email');
            setGeneralError('');
          }}
          placeholder="you@email.com"
          error={validationErrors.email}
        />
        {step === 'request' && (
          <p className="text-xs text-[var(--muted-foreground)]">{t('forgot.helperText')}</p>
        )}

        {step === 'verify' && (
          <>
            <Input
              type="text"
              label={t('forgot.otpLabel')}
              value={otp}
              onChange={(event) => {
                const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(digitsOnly);
                clearFieldError('otp');
                setGeneralError('');
              }}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              error={validationErrors.otp}
            />
            <PasswordInput
              label={t('forgot.newPasswordLabel')}
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                clearFieldError('newPassword');
                setGeneralError('');
              }}
              placeholder="••••••"
              error={validationErrors.newPassword}
            />
            <PasswordInput
              label={t('forgot.confirmPasswordLabel')}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                clearFieldError('confirmPassword');
                setGeneralError('');
              }}
              placeholder="••••••"
              error={validationErrors.confirmPassword}
            />
            <p className="text-xs text-[var(--muted-foreground)]">{t('forgot.passwordHint')}</p>
          </>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
          {step === 'request' ? t('forgot.requestOtp') : t('forgot.resetCta')}
        </Button>
      </form>
    );
  };

  return (
    <>
      <PageLoader />
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] font-[var(--font-sans)] relative p-4 sm:p-6 md:p-8">
        <div className="fixed inset-0 z-0">
          <Image
            src="/img/Background1.png"
            alt="Forgot password background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
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
          <h1 className="text-center text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-[var(--foreground)]">
            {t('forgot.title')}
          </h1>
          {step !== 'success' && (
            <p className="text-center text-sm text-[var(--muted-foreground)] mb-4">
              {t('forgot.description')}
            </p>
          )}

          {generalError && (
            <div className="text-[var(--destructive)] mb-4 text-center text-sm bg-white p-3 rounded border border-[var(--destructive)]/30">
              {generalError}
            </div>
          )}

          {infoMessage && step !== 'success' && (
            <div className="text-[var(--foreground)] mb-4 text-center text-sm bg-white p-3 rounded border border-emerald-200">
              {infoMessage}
              {formattedExpiry && step === 'verify' && (
                <span className="block mt-1 text-xs text-[var(--muted-foreground)]">
                  {t('forgot.otpHint', { time: formattedExpiry })}
                </span>
              )}
            </div>
          )}

          {renderForm()}

          <div className="text-center mt-4">
            <Link href="/auth/login" className="text-[var(--shadow-color)] text-xs sm:text-sm hover:underline transition-colors">
              {t('forgot.backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
