'use client';

import { useRef, useState } from 'react';
import type { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/hooks/useAuth';
import { initFirebaseClient, createRecaptchaVerifier, sendSignInCode } from '@/lib/firebaseClient';
import { 
  Input, 
  Button, 
  AuthDivider, 
  AuthLink,
  PageLoader 
} from '@/components/ui';
import { OTPInput } from '@/components/ui/OTPInput';

export default function PhoneLoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countdown, setCountdown] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { loginWithFirebase, isLoading, error } = useAuth();
  const t = useTranslations('auth');
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaId = 'recaptcha-container';

  const validatePhone = () => {
    const errors: Record<string, string> = {};
    
    if (!phone) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else {
      const cleaned = phone.trim().replace(/\s+/g, '');
      // Accept: 0901234567, +84901234567, 84901234567
      if (!/^(\+84|84|0)[3-9][0-9]{8}$/.test(cleaned)) {
        errors.phone = 'Số điện thoại không hợp lệ. VD: 0901234567 hoặc +84901234567';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePhone()) {
      return;
    }
    try {
      // Initialize firebase client
      initFirebaseClient();

      // create/invisible recaptcha
      verifierRef.current = createRecaptchaVerifier(recaptchaId);

      // normalize phone for firebase (+84...)
      let phoneForFirebase = phone.trim();
      if (phoneForFirebase.startsWith('0')) phoneForFirebase = '+84' + phoneForFirebase.substring(1);
      else if (!phoneForFirebase.startsWith('+')) phoneForFirebase = '+' + phoneForFirebase;

      const confirmationResult = await sendSignInCode(phoneForFirebase, verifierRef.current);
      confirmationRef.current = confirmationResult;

      setStep('otp');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Firebase send code error:', err);
      setValidationErrors({ phone: 'Không thể gửi mã. Vui lòng thử lại.' });
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setValidationErrors({ otp: 'Vui lòng nhập đủ 6 số' });
      return;
    }
    try {
      if (!confirmationRef.current) {
        setValidationErrors({ otp: 'Không có mã xác thực. Vui lòng gửi lại OTP.' });
        return;
      }

      const userCredential = await confirmationRef.current.confirm(otp);
      const idToken = await userCredential.user.getIdToken();
      await loginWithFirebase(idToken);
    } catch (err) {
      console.error('Confirm OTP error:', err);
      setValidationErrors({ otp: 'Mã OTP không đúng hoặc đã hết hạn' });
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    try {
      // Recreate recaptcha and resend
      verifierRef.current = createRecaptchaVerifier(recaptchaId);
      let phoneForFirebase = phone.trim();
      if (phoneForFirebase.startsWith('0')) phoneForFirebase = '+84' + phoneForFirebase.substring(1);
      else if (!phoneForFirebase.startsWith('+')) phoneForFirebase = '+' + phoneForFirebase;
      const confirmationResult = await sendSignInCode(phoneForFirebase, verifierRef.current);
      confirmationRef.current = confirmationResult;
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Resend code error:', err);
      setValidationErrors({ phone: 'Không thể gửi lại mã. Vui lòng thử lại.' });
    }
  };

  const handleChangePhone = () => {
    setStep('phone');
    setOtp('');
    setValidationErrors({});
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
            {step === 'phone' ? 'Đăng nhập bằng SĐT' : 'Xác thực OTP'}
          </h1>
          
          {error && (
            <div className="text-[var(--destructive)] mb-4 text-center text-sm bg-white-50 p-3 rounded">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input
                type="tel"
                label="Số điện thoại"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (validationErrors.phone) {
                    setValidationErrors(prev => ({ ...prev, phone: '' }));
                  }
                }}
                placeholder="0901234567"
                disabled={isLoading}
                error={validationErrors.phone}
              />

              {/* reCAPTCHA container for Firebase (invisible) */}
              <div id={recaptchaId} />

              <Button 
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                Gửi mã OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <p className="text-center text-sm text-gray-600">
                  Mã OTP đã được gửi đến số <br />
                  <span className="font-semibold">{phone}</span>
                  <button
                    type="button"
                    onClick={handleChangePhone}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Đổi số
                  </button>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-center">
                  Nhập mã OTP
                </label>
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                  error={validationErrors.otp}
                />
              </div>

              <div className="text-center text-sm">
                {countdown > 0 ? (
                  <p className="text-gray-600">
                    Gửi lại mã sau <span className="font-semibold">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Gửi lại mã OTP
                  </button>
                )}
              </div>

              <Button 
                type="submit"
                isLoading={isLoading}
                className="w-full"
              >
                Xác nhận
              </Button>
            </form>
          )}

          <AuthDivider text="Hoặc đăng nhập bằng" />

          <AuthLink 
            href="/auth/login"
            text="Đăng nhập bằng"
            linkText="Email"
            className="mt-3 sm:mt-4 text-xs sm:text-sm"
          />
        </div>
      </div>
    </>
  );
}
