'use client'

import { useState } from 'react';
import Image from 'next/image';
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

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const { register, loginWithGoogle, isLoading, error } = useAuth();
    const [fullName, setFullName] = useState('');
    const t = useTranslations('auth');

    // Temporary Facebook register handler  
    const registerWithFacebook = async () => {
        console.log('Facebook register clicked - not implemented yet');
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if(!fullName.trim()){
            errors.fullName = t('validation.fullNameRequired');
        } else if (fullName.trim().length < 2) {
            errors.fullName = t('validation.fullNameMinLength');
        }
        if(!email) {
            errors.email = t('validation.emailRequired');
        } else if (!validateEmail(email)) {
            errors.email = t('validation.emailInvalid');
        }
        if(!password) {
            errors.password = t('validation.passwordRequired');
        } else if (password.length < 6) {
            errors.password = t('validation.passwordMinLength');
        }

        if(!confirmPassword) {
            errors.confirmPassword = t('validation.confirmPasswordRequired');
        } else if (password !== confirmPassword) {
            errors.confirmPassword = t('validation.passwordMismatch');
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const success = await register({
        fullName,
        email,
        password
    });

    if (success) {

    }
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
                    {t('register.title')}
                </h1>
                
                {error && (
                    <div className="text-[var(--destructive)] mb-4 text-center text-sm bg-red-50 p-3 rounded">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Input
                            type="text"
                            placeholder={t('register.fullName')}
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                                if (validationErrors.fullName) {
                                    setValidationErrors(prev => ({ ...prev, fullName: '' }));
                                }
                            }}
                            error={validationErrors.fullName}
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <Input
                            type="email"
                            placeholder={t('register.email')}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (validationErrors.email) {
                                    setValidationErrors(prev => ({ ...prev, email: '' }));
                                }
                            }}
                            error={validationErrors.email}
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <PasswordInput
                            label=""
                            placeholder={t('register.password')}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (validationErrors.password) {
                                    setValidationErrors(prev => ({ ...prev, password: '' }));
                                }
                            }}
                            error={validationErrors.password}
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <PasswordInput
                            label=""
                            placeholder={t('register.confirmPassword')}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (validationErrors.confirmPassword) {
                                    setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
                                }
                            }}
                            error={validationErrors.confirmPassword}
                            disabled={isLoading}
                        />
                    </div>

                    <Button 
                        type="submit"
                        isLoading={isLoading}
                        className="w-full"
                        disabled={isLoading}
                    >
                        {t('register.submit')}
                    </Button>
                </form>

                <AuthDivider text={t('social.orLoginWith')} />

                <div className="grid grid-cols-2 gap-3">
                    <GoogleSignInButton 
                        onClick={loginWithGoogle}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="w-full"
                    />

                    <FacebookSignInButton 
                        onClick={registerWithFacebook}
                        disabled={isLoading}
                        isLoading={isLoading}
                        className="w-full"
                    />
                </div>

                <AuthLink 
                    href="/auth/login"
                    text={t('register.hasAccount')}
                    linkText={t('register.signIn')}
                    className="mt-4"
                />
            </div>
        </div>
    );
}