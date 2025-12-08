'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import clsx from 'clsx';
import { ICONS } from '@/shared/constants/images';
import { container } from '@/presentation/di/container';
import { useAiAssistantViewModel } from '@/presentation/viewmodels/useAiAssistantViewModel';
import { AiAssistantPanel } from './AiAssistantPanel';

export const AiAssistantWidget: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations('aiAssistant');
  const askAiAssistantUseCase = container.askAiAssistantUseCase;

  const {
    messages,
    inputValue,
    setInputValue,
    isPanelOpen,
    togglePanel,
    closePanel,
    sendMessage,
    retry,
    canRetry,
    isSending,
    status,
    error,
    clearChat,
    hasConversation,
  } = useAiAssistantViewModel(
    { askAiAssistantUseCase },
    {
      locale,
      greeting: t('panel.greeting'),
    }
  );

  const launcherLabel = useMemo(
    () => (isPanelOpen ? t('launcher.closeLabel') : t('launcher.openLabel')),
    [isPanelOpen, t]
  );

  return (
    <>
      <AiAssistantPanel
        open={isPanelOpen}
        onClose={closePanel}
        messages={messages}
        inputValue={inputValue}
        onInputChange={(value) => setInputValue(value)}
        onSend={sendMessage}
        onRetry={retry}
        onClear={clearChat}
        canRetry={canRetry}
        isSending={isSending}
        status={status}
        error={error}
        translate={t}
        hasConversation={hasConversation}
      />

      <button
        type="button"
        aria-label={launcherLabel}
        title={t('launcher.tooltipDesktop')}
        onClick={togglePanel}
        className={clsx(
          'fixed bottom-12 right-4 z-[60] flex items-center gap-3 rounded-full bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 text-white shadow-xl ring-1 ring-green-200/40 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 md:bottom-15 md:right-8',
          isPanelOpen && 'shadow-2xl'
        )}
      >
        <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Image src={ICONS.CHAT} alt={launcherLabel} width={24} height={24} className="drop-shadow" />
          <span className="absolute inset-0 animate-ping rounded-full bg-white/20" aria-hidden />
        </span>
      </button>
    </>
  );
};

export default AiAssistantWidget;
