'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Button } from './Button';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  text?: string;
}

export function GoogleSignInButton({ 
  onSuccess, 
  disabled = false, 
  isLoading = false,
  className = "",
  text = "Google"
}: GoogleSignInButtonProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      onSuccess(credentialResponse.credential);
    } else {
      console.error('No credential received from Google');
    }
  };

  const handleError = () => {
    console.error('Google login failed');
  };

  const handleClick = () => {
    // Trigger the hidden Google button
    const googleBtn = googleButtonRef.current?.querySelector('div[role="button"]') as HTMLElement;
    if (googleBtn && !disabled && !isLoading) {
      googleBtn.click();
    }
  };

  return (
    <>
      {/* Hidden Google Login button */}
      <div ref={googleButtonRef} style={{ display: 'none' }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
      
      {/* Custom styled button */}
      <Button 
        variant="outline"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`flex items-center justify-center gap-2 ${className}`}
      >
        <Image 
          src="/icons/google.png"
          alt="Google"
          width={20}
          height={20}
          className="flex-shrink-0"
        />
        <span className="text-sm font-medium">{text}</span>
      </Button>
    </>
  );
}