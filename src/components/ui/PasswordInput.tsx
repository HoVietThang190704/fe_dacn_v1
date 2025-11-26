"use client"

import { useState } from 'react';
import Icon from '@/presentation/components/ui/Icon';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function PasswordInput({ label = "Password", ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm text-[var(--muted-foreground)]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className="w-full p-3 pr-12 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20"
          autoComplete="new-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          style={{
            backgroundImage: 'none'
          } as React.CSSProperties}
          {...props}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <Icon
            name={showPassword ? 'EYE_OPEN' : 'EYE_CLOSED'}
            width={20}
            height={20}
            className="opacity-70 hover:opacity-100 transition-opacity"
            alt={showPassword ? 'Hide password' : 'Show password'}
          />
        </button>
      </div>
      {props.error && (
        <p className="text-sm text-[var(--destructive)]">{props.error}</p>
      )}
    </div>
  );
}