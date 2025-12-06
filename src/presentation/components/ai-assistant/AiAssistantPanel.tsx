'use client';

import { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { AiAssistantMessage } from '@/domain/entities/AiAssistant';
import { ICONS } from '@/shared/constants/images';
import { AiAssistantMessageBubble } from './AiAssistantMessageBubble';
import { AiAssistantStatus } from '@/presentation/viewmodels/useAiAssistantViewModel';

interface Props {
  open: boolean;
  onClose: () => void;
  messages: AiAssistantMessage[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onRetry: () => void;
  onClear: () => void;
  canRetry: boolean;
  isSending: boolean;
  status: AiAssistantStatus;
  error?: string | null;
  translate: (key: string) => string;
  hasConversation: boolean;
}

export const AiAssistantPanel: React.FC<Props> = ({
  open,
  onClose,
  messages,
  inputValue,
  onInputChange,
  onSend,
  onRetry,
  onClear,
  canRetry,
  isSending,
  status,
  error,
  translate,
  hasConversation,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    textAreaRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages, open]);

  const statusPill = useMemo(() => {
    return {
      ready: {
        label: translate('panel.status.ready'),
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        dot: 'bg-emerald-500',
      },
      thinking: {
        label: translate('panel.status.thinking'),
        className: 'bg-amber-50 text-amber-700 border border-amber-100',
        dot: 'bg-amber-500 animate-pulse',
      },
      failed: {
        label: translate('panel.status.failed'),
        className: 'bg-red-50 text-red-600 border border-red-100',
        dot: 'bg-red-500',
      },
    } satisfies Record<AiAssistantStatus, { label: string; className: string; dot: string }>;
  }, [translate]);

  const helperText = useMemo(() => {
    if (status === 'thinking') return translate('panel.loading');
    if (status === 'failed') return translate('panel.error');
    return translate('panel.status.ready');
  }, [status, translate]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim()) return;
    onSend();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/20 backdrop-blur-sm md:justify-end" aria-modal="true" role="dialog">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <section
        className="relative z-10 flex h-full w-full max-w-full flex-col bg-white shadow-2xl transition md:mx-6 md:mb-6 md:h-[640px] md:w-[420px] md:rounded-[32px]"
      >
        <header className="border-b border-gray-100 px-5 py-4">
          <div className="flex flex-col items-start justify-between gap-2 ">
            <div className ="flex flex-row items-center justify-between w-full">
              <h2 className="text-2xl font-semibold text-gray-900">{translate('panel.title')}</h2>
              <button
                  type="button"
                  onClick={onClose}
                  aria-label={translate('launcher.closeLabel')}
                  className="rounded-full justify-end border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                >
                  <Image src={ICONS.CROSS} alt={translate('launcher.closeLabel')} width={16} height={16} />
                </button>
            </div>
        
            <div className="flex flex-row items-end gap-2">
              <div className={clsx('flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm', statusPill[status].className)}>
                <span className={clsx('h-2 w-2 rounded-full', statusPill[status].dot)} />
                {statusPill[status].label}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClear}
                  disabled={!hasConversation}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {translate('panel.clear')}
                </button>
              </div>
            </div>
            
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-gradient-to-b from-orange-50/40 via-white to-white px-5 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <AiAssistantMessageBubble key={message.id} message={message} translate={translate} />
            ))}
            {!hasConversation && (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 px-4 py-5 text-sm text-gray-500">
                {translate('panel.empty')}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          {error && (
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              <p className="pr-3">{error}</p>
              {canRetry && (
                <button type="button" onClick={onRetry} className="font-semibold text-red-600 underline">
                  {translate('panel.retry')}
                </button>
              )}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:border-orange-300 focus-within:ring-1 focus-within:ring-orange-200 px-3 py-2">
              <div className="flex items-center gap-3">
                <input
                  ref={textAreaRef as unknown as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={inputValue}
                  onChange={(event) => onInputChange(event.target.value)}
                  placeholder={translate('panel.placeholder')}
                  className="flex-1 w-full rounded-full border-0 px-3 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      if (inputValue.trim().length === 0) return;
                      onSend();
                    }
                  }}
                />
                <button
                  type="button"
                  aria-label={translate('panel.send')}
                  onClick={onSend}
                  disabled={isSending || !inputValue.trim()}
                  className={clsx(
                    'h-10 w-10 flex items-center justify-center rounded-full transition',
                    inputValue.trim() && !isSending ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg' : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Image src={ICONS.DIRECT} alt={translate('panel.send')} width={18} height={18} />
                </button>
              </div>
              
            </div>

            <div className="flex flex-col gap-1 text-[11px] text-gray-400">
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AiAssistantPanel;
