'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { Button } from './Button';

interface FacebookSignInButtonProps {
  onSuccess: (accessToken: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  text?: string;
}

// Declare Facebook SDK types
declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: {
            accessToken: string;
            expiresIn: number;
            signedRequest: string;
            userID: string;
          };
          status: string;
        }) => void,
        options?: { scope: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export function FacebookSignInButton({ 
  onSuccess,
  onError,
  disabled = false, 
  isLoading = false,
  className = "",
  text = "Facebook"
}: FacebookSignInButtonProps) {
  const [isFBReady, setIsFBReady] = useState(false);
  const [isLoadingFB, setIsLoadingFB] = useState(false);

  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      // Check if already loaded
      if (window.FB) {
        setIsFBReady(true);
        return;
      }

      // Initialize Facebook SDK
      window.fbAsyncInit = function() {
        window.FB?.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        });
        setIsFBReady(true);
      };

      // Load SDK script
      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    };

    loadFacebookSDK();
  }, []);

  const handleFacebookLogin = () => {
    if (!isFBReady || !window.FB) {
      onError?.('Facebook SDK chưa sẵn sàng');
      return;
    }

    setIsLoadingFB(true);

    window.FB.login(
      (response) => {
        setIsLoadingFB(false);
        
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          onSuccess(accessToken);
        } else {
          onError?.('Đăng nhập Facebook bị hủy');
        }
      },
      { scope: 'public_profile,email' }
    );
  };

  return (
    <Button 
      variant="outline"
      onClick={handleFacebookLogin}
      disabled={disabled || isLoading || isLoadingFB || !isFBReady}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <Image 
        src={ICONS.FACEBOOK}
        alt="Facebook"
        width={20}
        height={20}
        className="flex-shrink-0"
      />
      <span className="text-sm font-medium">
        {isLoadingFB ? 'Đang xử lý...' : text}
      </span>
    </Button>
  );
}