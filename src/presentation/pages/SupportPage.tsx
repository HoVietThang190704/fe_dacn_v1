 'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { CreateSupportTicketInput } from '@/domain/entities/Support';
import { ICONS } from '@/shared/constants/images';
import { container } from '../di/container';
import { useSupportViewModel } from '../viewmodels/useSupportViewModel';
import { useSupportChatViewModel } from '../viewmodels/useSupportChatViewModel';
import { QuickActionCard } from '@/presentation/components/support/QuickActionCard';
import { TabButton } from '@/presentation/components/support/TabButton';
import { FAQCard } from '@/presentation/components/support/FAQCard';
import { TicketCard } from '@/presentation/components/support/TicketCard';
import { ChatPopup } from '@/presentation/components/support/ChatPopup';
import { CreateTicketModal } from '@/presentation/components/support/CreateTicketModal';
import { LoadingState } from '@/presentation/components/support/LoadingState';
import { ErrorState } from '@/presentation/components/support/ErrorState';

export const SupportPage: React.FC = () => {
  const t = useTranslations('support');
  const locale = useLocale();

  const getSupportDataUseCase = container.getSupportDataUseCase;
  const createSupportTicketUseCase = container.createSupportTicketUseCase;
  const voteSupportFaqUseCase = container.voteSupportFaqUseCase;
  const getSupportChatThreadUseCase = container.getSupportChatThreadUseCase;
  const sendSupportChatMessageUseCase = container.sendSupportChatMessageUseCase;
  const markSupportChatThreadReadUseCase = container.markSupportChatThreadReadUseCase;

  const {
    tickets,
    faqs,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    refresh,
    createTicket,
    isCreating,
    creationError,
    clearCreationError,
    voteOnFaq,
    votingFaqId,
    voteError,
    clearVoteError,
  } = useSupportViewModel(getSupportDataUseCase, createSupportTicketUseCase, voteSupportFaqUseCase, {
    locale,
  });

  const {
    messages: chatMessages,
    chatInput,
    setChatInput,
    isChatOpen,
    openChat,
    closeChat,
    isLoading: isChatLoading,
    loadError: chatLoadError,
    isSending: isChatSending,
    sendMessage,
    requiresAuth: chatRequiresAuth,
    socketStatus,
    unreadCount,
    refresh: refreshChat,
  } = useSupportChatViewModel(
    getSupportChatThreadUseCase,
    sendSupportChatMessageUseCase,
    markSupportChatThreadReadUseCase,
    {
      greeting: t('chatBox.greeting'),
    }
  );

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [tickets]);

  const handleEmailClick = useCallback(() => {
    const email = String(t('contactEmail'));
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    window.open(gmailUrl, '_blank', 'noopener');
  }, [t]);

  const handleOpenChat = useCallback(() => {
    setActiveTab('tickets');
    openChat();
  }, [openChat, setActiveTab]);

  const handleChatClose = useCallback(() => {
    closeChat();
  }, [closeChat]);

  const handleChatLoginRedirect = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const handleOpenCreateModal = () => {
    clearCreationError();
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    clearCreationError();
  };

  const handleCreateTicket = async (values: CreateSupportTicketInput & {
    relatedOrderId?: string;
    relatedShopId?: string;
  }) => {
    try {
      await createTicket(values);
      setSuccessMessage(t('messages.ticketCreated'));
      setCreateModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const needLoginPatterns = ['token', 'Unauthorized', 'Không tìm thấy token', 'Token không hợp lệ', 'Người dùng không tồn tại'];
      const needsLogin = needLoginPatterns.some((p) => msg.toLowerCase().includes(p.toLowerCase()));
      if (needsLogin) {
        setCreateModalOpen(false);
        window.location.href = '/login';
        return;
      }
      console.error('Ticket creation failed:', msg);
    }
  };

  if (isLoading && !tickets.length && !faqs.length) {
    return <LoadingState t={t} />;
  }

  if (error && !tickets.length && !faqs.length) {
    return <ErrorState error={error} onRetry={refresh} t={t} />;
  }

  return (
    <section className="min-h-screen bg-gray-50 px-3 pb-10 pt-4 sm:px-6 lg:px-10">
      {successMessage && (
        <div className="fixed right-4 top-4 z-40 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg">
          <div className="h-6 w-6 flex-shrink-0">
            <Image src={ICONS.YES} alt={String(t('icons.successAlt'))} width={24} height={24} />
          </div>
          <p className="text-sm font-medium text-green-800">{successMessage}</p>
        </div>
      )}

      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-600 md:text-base">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {error && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
              {error}
            </span>
          )}
          <button onClick={handleOpenCreateModal} className="inline-flex items-center gap-2 rounded-full bg-gray-300 px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gray-400">
            <Image src={ICONS.PLUS} alt={String(t('icons.addAlt'))} width={18} height={18} />
            {t('actions.newTicket')}
          </button>
        </div>
      </header>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <QuickActionCard iconSrc={ICONS.PHONE_CALL} title={t('hotline')} description={t('quickActions.hotlineNumber')} />
        <QuickActionCard iconSrc={ICONS.EMAIL_ICON} title={t('email')} description={String(t('contactEmail'))} onClick={handleEmailClick} actionLabel={t('actions.openEmail')} />
        <div className="relative">
          {unreadCount > 0 && (
            <span
              className="absolute -right-1.5 -top-1.5 min-w-[32px] rounded-full bg-red-500 px-2 py-0.5 text-center text-xs font-semibold text-white"
              aria-label={t('chatBox.unreadBadge', { count: unreadCount })}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <QuickActionCard iconSrc={ICONS.CHAT} title={t('chat')} description={t('quickActions.chatDescription')} onClick={handleOpenChat} actionLabel={t('actions.openChat')} />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-white p-2 shadow-sm">
        <TabButton iconSrc={ICONS.QUESTION} isActive={activeTab === 'faqs'} onClick={() => setActiveTab('faqs')}>{t('faqsTab')}</TabButton>
        <TabButton iconSrc={ICONS.QUOTE_REQUEST} isActive={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')}>{t('ticketsTab', { count: tickets.length })}</TabButton>
      </div>

      <div className="space-y-4">
        {activeTab === 'faqs' ? (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-orange-900 sm:text-lg">
                  {t('cta.title')}
                </h2>
                <p className="mt-1 text-sm text-orange-700">{t('cta.subtitle')}</p>
              </div>
              <button onClick={handleOpenCreateModal} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-400">
                <Image src={ICONS.PLUS} alt={String(t('icons.addAlt'))} width={16} height={16} />
                {t('actions.newTicket')}
              </button>
            </div>

            {faqs.map((faq) => (
              <FAQCard
                key={faq.id}
                faq={faq}
                t={t}
                onVote={voteOnFaq}
                isVoting={votingFaqId === faq.id}
                voteError={voteError?.faqId === faq.id ? voteError.message : null}
                clearVoteError={clearVoteError}
              />
            ))}

            {faqs.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
                <p className="text-sm text-gray-500">{t('faqsEmpty')}</p>
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-4">
            {sortedTickets.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <Image src={ICONS.QUOTE_REQUEST} alt={String(t('noTickets'))} width={96} height={96} className="mx-auto mb-4 h-20 w-20" />
                <h3 className="text-lg font-semibold text-gray-800">{t('noTickets')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('noTicketsDesc')}</p>
                <button onClick={handleOpenCreateModal} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
                  <Image src={ICONS.PLUS} alt={String(t('icons.addAlt'))} width={16} height={16} />
                  {t('actions.newTicket')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} t={(k, v) => t(k, v)} locale={locale} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <ChatPopup
        open={isChatOpen}
        onClose={handleChatClose}
        t={t}
        messages={chatMessages}
        locale={locale}
        chatInput={chatInput}
        onChatInputChange={(value) => setChatInput(value)}
        onSend={sendMessage}
        isSending={isChatSending}
        isLoading={isChatLoading}
        loadError={chatLoadError}
        onRetry={refreshChat}
        requiresAuth={chatRequiresAuth}
        onRequestLogin={handleChatLoginRedirect}
        socketStatus={socketStatus}
      />

      <CreateTicketModal open={isCreateModalOpen} onClose={handleCloseCreateModal} onSubmit={handleCreateTicket} isSubmitting={isCreating} error={creationError} t={t} />
    </section>
  );
};

 
