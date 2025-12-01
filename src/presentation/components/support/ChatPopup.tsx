import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { SupportChatMessage } from '@/domain/entities/Support';
import { SupportChatSocketStatus } from '@/presentation/hooks/useSupportChatSocket';
import { ICONS } from '@/shared/constants/images';
import { ChatBubble } from './ChatBubble';

type Props = {
  open: boolean;
  onClose: () => void;
  t?: (key: string, values?: Record<string, string | number | Date>) => string;
  messages: SupportChatMessage[];
  locale: string;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  isLoading: boolean;
  loadError?: string | null;
  onRetry: () => void;
  requiresAuth: boolean;
  onRequestLogin: () => void;
  socketStatus: SupportChatSocketStatus;
};

export const ChatPopup: React.FC<Props> = ({
  open,
  onClose,
  t,
  messages,
  locale,
  chatInput,
  onChatInputChange,
  onSend,
  isSending,
  isLoading,
  loadError,
  onRetry,
  requiresAuth,
  onRequestLogin,
  socketStatus,
}) => {
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const resolveTranslation = useCallback((key: string, fallback: string) => {
    try {
      if (!t) return fallback;
      const origConsoleError = console.error;
      let value: string | null = null;
      try {
        console.error = () => {};
        const typedT = t as unknown as ((k: string, opts?: { default?: string }) => string);
        value = typedT(key, { default: fallback });
      } catch {
        value = null;
      } finally {
        console.error = origConsoleError;
      }
      if (!value) return fallback;
      const unmatchedValues = [key, `support.${key}`];
      return unmatchedValues.includes(value) ? fallback : value;
    } catch {
      return fallback;
    }
  }, [t]);

  const tLocal = (key: string, opts?: { default?: string }) => resolveTranslation(key, opts?.default ?? '');

  const statusConfig = useMemo(() => {
    return {
      connected: {
        label: resolveTranslation('chatBox.connection.connected', 'Connected'),
        container: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        dot: 'bg-emerald-500',
      },
      connecting: {
        label: resolveTranslation('chatBox.connection.connecting', 'Connecting'),
        container: 'bg-amber-50 text-amber-700 border border-amber-100',
        dot: 'bg-amber-500',
      },
      disconnected: {
        label: resolveTranslation('chatBox.connection.disconnected', 'Offline'),
        container: 'bg-gray-100 text-gray-600 border border-gray-200',
        dot: 'bg-gray-400',
      },
    } satisfies Record<SupportChatSocketStatus, { label: string; container: string; dot: string }>;
  }, [resolveTranslation]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Focus the input as soon as the dialog opens so keyboard users don't interact with background
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, open]);

  if (!open) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requiresAuth) {
      onRequestLogin();
      return;
    }
    onSend();
  };

  const status = statusConfig[socketStatus];

  const renderMessages = () => {
    if (isLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-500">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-orange-400" aria-hidden />
          <p>{resolveTranslation('chatBox.loading', 'Loading conversation...')}</p>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-red-600">{loadError}</p>
            <button
            type="button"
            onClick={onRetry}
            className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
            >
            {tLocal('actions.refresh')}
          </button>
        </div>
      );
    }

    if (requiresAuth) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-gray-600">{resolveTranslation('chatBox.loginPrompt', 'Please sign in to continue this chat.')}</p>
          <button
            type="button"
            onClick={onRequestLogin}
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            {resolveTranslation('chatBox.loginCta', 'Login to chat')}
          </button>
        </div>
      );
    }

    if (messages.length === 0) {
      return <p className="mt-10 text-center text-sm text-gray-500">{tLocal('chatBox.empty')}</p>;
    }

    return messages.map((message) => <ChatBubble key={message.id} message={message} locale={locale} />);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={handleOverlayClick}>
      <div className="relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:my-8 md:h-[90vh] md:w-[420px] md:rounded-3xl" onClick={(e) => e.stopPropagation()} style={{ zIndex: 10000 }}>
        <header className="relative overflow-hidden border-b border-gray-100 px-5 py-5">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-white to-transparent opacity-70" aria-hidden />
          <div className="relative flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-gray-900">{tLocal('chatBox.title')}</h2>
              <p className="text-sm text-gray-600">{tLocal('chatBox.subtitle')}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${status.container}`}>
                <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden />
                {status.label}
              </div>
              <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
                <Image src={ICONS.CROSS} alt={String(tLocal('icons.closeAlt'))} width={16} height={16} />
              </button>
            </div>
          </div>
        </header>

        <div ref={messagesRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-white via-orange-50/20 to-gray-50 px-5 py-4">
          {socketStatus === 'disconnected' && !isLoading && !loadError && !requiresAuth && (
            <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {resolveTranslation('chatBox.connectionLost', 'Connection lost. Please try again shortly.')}
            </div>
          )}
          {renderMessages()}
        </div>

        <div className="border-t border-gray-100 bg-white px-5 py-4">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="relative">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  value={chatInput}
                  onChange={(event) => onChatInputChange(event.target.value)}
                  placeholder={tLocal('chatBox.placeholder')}
                  className="flex-1 min-w-0 rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300 disabled:cursor-not-allowed disabled:bg-gray-50"
                  disabled={requiresAuth || isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (requiresAuth) {
                        onRequestLogin();
                        return;
                      }
                      if (isLoading || isSending) return;
                      onSend();
                    }
                  }}
                />
                <button
                  type="submit"
                  aria-label={String(tLocal('chatBox.send'))}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                    chatInput.trim() && !isSending && !isLoading && !requiresAuth
                      ? 'bg-gradient-to-tr from-gray-100 to-gray-200 text-white hover:scale-105'
                      : 'bg-gray-50 text-gray-100 cursor-not-allowed'
                  }`}
                  disabled={!chatInput.trim() || isSending || isLoading || requiresAuth}
                >
                  <Image src={ICONS.DIRECT} alt={String(tLocal('icons.sendAlt'))} width={18} height={18} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {requiresAuth && (
                  <button type="button" onClick={onRequestLogin} className="text-xs font-semibold text-orange-600 underline">
                    {resolveTranslation('chatBox.loginCta', 'Login to chat')}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
