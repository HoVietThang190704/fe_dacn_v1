'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
  FAQ,
  SupportTicket,
  TicketPriority,
  TicketStatus,
  TicketType,
  CreateSupportTicketInput,
} from '@/domain/entities/Support';
import { ICONS } from '@/shared/constants/images';
import { container } from '../di/container';
import { useSupportViewModel } from '../viewmodels/useSupportViewModel';

const SUPPORT_EMAIL = 'quangnguyen310720042gmail.com';
const TICKET_TYPES: TicketType[] = ['support', 'question', 'refund', 'bug', 'feature', 'other'];
const PRIORITIES: TicketPriority[] = [
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.URGENT,
];

const statusStyles: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',
  [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.ON_HOLD]: 'bg-purple-100 text-purple-800',
  [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [TicketStatus.CLOSED]: 'bg-gray-200 text-gray-700',
  [TicketStatus.REJECTED]: 'bg-red-100 text-red-700',
};

const priorityIndicator: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: 'text-gray-500',
  [TicketPriority.MEDIUM]: 'text-blue-500',
  [TicketPriority.HIGH]: 'text-orange-500',
  [TicketPriority.URGENT]: 'text-red-600',
};

const isValidObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const formatDate = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);

type TranslationFn = (key: string, values?: Record<string, string | number | Date>) => string;

type ChatMessage = {
  id: string;
  author: 'user' | 'system';
  content: string;
  timestamp: Date;
};

export const SupportPage: React.FC = () => {
  const t = useTranslations('support');
  const locale = useLocale();

  const getSupportDataUseCase = container.getSupportDataUseCase;
  const createSupportTicketUseCase = container.createSupportTicketUseCase;
  const voteSupportFaqUseCase = container.voteSupportFaqUseCase;

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

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    setChatMessages((prev) => {
      if (!prev.length) {
        return [
          {
            id: 'welcome',
            author: 'system',
            content: t('chatBox.greeting'),
            timestamp: new Date(),
          },
        ];
      }

      return prev.map((message) =>
        message.id === 'welcome'
          ? { ...message, content: t('chatBox.greeting') }
          : message
      );
    });
  }, [t]);

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [tickets]);

  const handleEmailClick = useCallback(() => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      SUPPORT_EMAIL
    )}`;
    window.open(gmailUrl, '_blank', 'noopener');
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
      // common messages from backend/auth middleware
      const needLoginPatterns = ['token', 'Unauthorized', 'Không tìm thấy token', 'Token không hợp lệ', 'Người dùng không tồn tại'];
      const needsLogin = needLoginPatterns.some((p) => msg.toLowerCase().includes(p.toLowerCase()));
      if (needsLogin) {
        // redirect to login so user can authenticate and retry
        // keep modal open? close and open login
        setCreateModalOpen(false);
        // open login page in current tab
        window.location.href = '/login';
        return;
      }
      // otherwise error will be shown by modal via creationError from viewmodel
      console.error('Ticket creation failed:', msg);
    }
  };

  const handleSendChatMessage = () => {
    const message = chatInput.trim();
    if (!message) return;

    const now = new Date();
    setChatMessages((prev) => [
      ...prev,
      {
        id: `user-${now.getTime()}`,
        author: 'user',
        content: message,
        timestamp: now,
      },
      {
        id: `system-${now.getTime() + 1}`,
        author: 'system',
        content: t('chatBox.autoReply'),
        timestamp: new Date(now.getTime() + 1000),
      },
    ]);
    setChatInput('');
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
          <span className="text-xl">✅</span>
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
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full border border-orange-500 px-4 py-2 text-sm font-medium text-orange-500 transition-colors hover:bg-orange-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4 4v3h.01L4 7a6 6 0 111.757 4.242l1.415-1.414A4 4 0 104 7h3V4H4z" />
            </svg>
            {t('actions.refresh')}
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
          >
            <span className="text-lg leading-none">＋</span>
            {t('actions.newTicket')}
          </button>
        </div>
      </header>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <QuickActionCard
          icon={ICONS.PHONE_CALL}
          title={t('hotline')}
          description={t('quickActions.hotlineNumber')}
        />
        <QuickActionCard
          icon={ICONS.EMAIL_ICON}
          title={t('email')}
          description={SUPPORT_EMAIL}
          onClick={handleEmailClick}
        />
        <QuickActionCard
          icon={ICONS.CHAT}
          title={t('chat')}
          description={t('quickActions.chatDescription')}
          onClick={() => {
            setActiveTab('tickets');
            setChatOpen(true);
          }}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-white p-2 shadow-sm">
        <TabButton
          icon={ICONS.QUESTION}
          isActive={activeTab === 'faqs'}
          onClick={() => setActiveTab('faqs')}
        >
          {t('faqsTab')}
        </TabButton>
        <TabButton
          icon={ICONS.QUOTE_REQUEST}
          isActive={activeTab === 'tickets'}
          onClick={() => setActiveTab('tickets')}
        >
          {t('ticketsTab', { count: tickets.length })}
        </TabButton>
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
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                <span className="text-lg leading-none">＋</span>
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
                <Image
                  src={ICONS.QUOTE_REQUEST}
                  alt="No tickets"
                  width={96}
                  height={96}
                  className="mx-auto mb-4 h-20 w-20"
                />
                <h3 className="text-lg font-semibold text-gray-800">{t('noTickets')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('noTicketsDesc')}</p>
                <button
                  onClick={handleOpenCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  <span className="text-lg leading-none">＋</span>
                  {t('actions.newTicket')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} t={t} locale={locale} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <ChatPopup
        open={isChatOpen}
        onClose={() => setChatOpen(false)}
        t={t}
        messages={chatMessages}
        locale={locale}
        chatInput={chatInput}
        onChatInputChange={setChatInput}
        onSend={handleSendChatMessage}
      />

      <CreateTicketModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateTicket}
        isSubmitting={isCreating}
        error={creationError}
        t={t}
      />
    </section>
  );
};

const QuickActionCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  actionLabel?: string;
}> = ({ icon, title, description, onClick, actionLabel }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
          <Image src={icon} alt={title} width={28} height={28} className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          {actionLabel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) {
                  onClick();
                }
              }}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-orange-500 transition hover:text-orange-600"
            >
              {actionLabel}
              <span aria-hidden className="text-base leading-none">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  icon: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ icon, isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-orange-500 text-white shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Image src={icon} alt="tab" width={18} height={18} className="h-4 w-4" />
    {children}
  </button>
);

const FAQCard: React.FC<{
  faq: FAQ;
  t: TranslationFn;
  onVote: (faqId: string, vote: 'helpful' | 'not_helpful') => void | Promise<void>;
  isVoting: boolean;
  voteError: string | null;
  clearVoteError: () => void;
}> = ({ faq, t, onVote, isVoting, voteError, clearVoteError }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    if (voteError) {
      clearVoteError();
    }
    setIsExpanded((prev) => !prev);
  };

  const handleVote = (vote: 'helpful' | 'not_helpful') => {
    if (isVoting || faq.userVote === vote) return;
    onVote(faq.id, vote);
  };

  const helpfulSelected = faq.userVote === 'helpful';
  const notHelpfulSelected = faq.userVote === 'not_helpful';

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <button
        onClick={handleToggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
      >
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{faq.question}</h3>
          <span className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {faq.category}
          </span>
        </div>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-gray-500 transition ${isExpanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.185l3.71-3.955a.75.75 0 011.08 1.04l-4.25 4.53a.75.75 0 01-1.08 0l-4.25-4.53a.75.75 0 01.02-1.06z" />
        </svg>
      </button>
      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <p className="mt-4 text-sm leading-relaxed text-gray-700">{faq.answer}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="font-medium text-gray-600">{t('helpfulQuestion')}</span>
            <button
              type="button"
              onClick={() => handleVote('helpful')}
              disabled={isVoting}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                helpfulSelected
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-transparent bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              } ${isVoting ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <span aria-hidden>👍</span>
              <span>{faq.helpful}</span>
            </button>
            <button
              type="button"
              onClick={() => handleVote('not_helpful')}
              disabled={isVoting}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                notHelpfulSelected
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-transparent bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              } ${isVoting ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <span aria-hidden>👎</span>
              <span>{faq.notHelpful}</span>
            </button>
            {faq.userVote && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">
                {faq.userVote === 'helpful' ? t('yes') : t('no')}
              </span>
            )}
            {voteError && (
              <span className="text-sm font-medium text-red-500">{voteError}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TicketCard: React.FC<{ ticket: SupportTicket; t: TranslationFn; locale: string }> = ({ ticket, t, locale }) => {
  const statusLabel = t(`statuses.${ticket.status}`);
  const priorityLabel = t(`priorities.${ticket.priority}`);
  const typeLabel = t(`types.${ticket.type}`);

  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
              #{ticket.ticketNumber || ticket.id.slice(0, 8)}
            </span>
            <span className={`rounded-full px-3 py-1 ${statusStyles[ticket.status]}`}>{statusLabel}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-gray-600 shadow-inner">
              <span className={`h-2.5 w-2.5 rounded-full ${priorityIndicator[ticket.priority]} bg-current`}></span>
              {priorityLabel}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-gray-900">{ticket.title}</h3>
          {ticket.description && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">{ticket.description}</p>
          )}
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>{t('tickets.createdAt', { date: formatDate(ticket.createdAt, locale) })}</p>
          <p>{t('tickets.updatedAt', { date: formatDate(ticket.updatedAt, locale) })}</p>
        </div>
      </header>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">{typeLabel}</span>
          {ticket.commentsCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M18 10c0 3.314-3.134 6-7 6-.86 0-1.687-.114-2.464-.324L3 16l.908-3.632C3.329 11.543 3 10.8 3 10c0-3.314 3.134-6 7-6s7 2.686 7 6z" />
              </svg>
              {t('tickets.comments', { count: ticket.commentsCount })}
            </span>
          )}
        </div>
        <button className="inline-flex items-center gap-1 font-medium text-orange-500 transition hover:text-orange-600">
          {t('viewDetails')}
          <span aria-hidden className="text-base leading-none">→</span>
        </button>
      </footer>
    </article>
  );
};

const ChatBubble: React.FC<{ message: ChatMessage; locale: string }> = ({ message, locale }) => {
  const isUser = message.author === 'user';
  return (
    <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isUser ? 'rounded-br-sm bg-orange-500 text-white' : 'rounded-bl-sm bg-white text-gray-700'
        }`}
      >
        <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
        <span className={`mt-2 block text-xs ${isUser ? 'text-orange-100/80' : 'text-gray-400'}`}>
          {formatDate(message.timestamp, locale)}
        </span>
      </div>
    </div>
  );
};

const ChatPopup: React.FC<{
  open: boolean;
  onClose: () => void;
  t: TranslationFn;
  messages: ChatMessage[];
  locale: string;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
}> = ({ open, onClose, t, messages, locale, chatInput, onChatInputChange, onSend }) => {
  const messagesRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const container = messagesRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, open]);

  if (!open) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSend();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className="relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:my-8 md:h-[90vh] md:w-[420px] md:rounded-l-3xl md:rounded-r-none"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('chatBox.title')}</h2>
            <p className="text-xs text-gray-500">{t('chatBox.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {t('chatBox.betaTag')}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        </header>

        <div
          ref={messagesRef}
          className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4"
        >
          {messages.length === 0 ? (
            <p className="mt-10 text-center text-sm text-gray-500">{t('chatBox.empty')}</p>
          ) : (
            messages.map((message) => (
              <ChatBubble key={message.id} message={message} locale={locale} />
            ))
          )}
        </div>

        <div className="border-t border-gray-100 bg-white px-5 py-4">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <textarea
              value={chatInput}
              onChange={(event) => onChatInputChange(event.target.value)}
              placeholder={t('chatBox.placeholder')}
              className="h-28 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-400">
                <p className="font-semibold text-gray-600">{t('chatBox.noteTitle')}</p>
                <p className="mt-1 max-w-xs leading-relaxed text-gray-500">
                  {t('chatBox.noteContent')}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                disabled={!chatInput.trim()}
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2.94 2.94a1.5 1.5 0 012.12 0L10 7.879l4.94-4.94a1.5 1.5 0 112.12 2.122L12.121 10l4.94 4.94a1.5 1.5 0 01-2.122 2.12L10 12.121l-4.94 4.94a1.5 1.5 0 01-2.12-2.122L7.879 10l-4.94-4.94a1.5 1.5 0 010-2.12z" />
                </svg>
                {t('chatBox.send')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CreateTicketModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSupportTicketInput & { relatedOrderId?: string; relatedShopId?: string }) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  t: TranslationFn;
}> = ({ open, onClose, onSubmit, isSubmitting, error, t }) => {
  const [formValues, setFormValues] = useState<{
    title: string;
    description: string;
    type: TicketType;
    priority: TicketPriority;
    relatedOrderId: string;
    relatedShopId: string;
  }>(
    () => ({
      title: '',
      description: '',
      type: 'support',
      priority: TicketPriority.MEDIUM,
      relatedOrderId: '',
      relatedShopId: '',
    })
  );

  useEffect(() => {
    if (!open) {
      setFormValues({
        title: '',
        description: '',
        type: 'support',
        priority: TicketPriority.MEDIUM,
        relatedOrderId: '',
        relatedShopId: '',
      });
    }
  }, [open]);

  const handleChange = <K extends keyof typeof formValues>(key: K, value: (typeof formValues)[K]) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedOrder = formValues.relatedOrderId.trim();
    const trimmedShop = formValues.relatedShopId.trim();

    const payload: CreateSupportTicketInput & {
      relatedOrderId?: string;
      relatedOrderReference?: string;
      relatedShopId?: string;
      relatedShopReference?: string;
    } = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      type: formValues.type,
      priority: formValues.priority,
      isPublic: true,
    };

    if (trimmedOrder) {
      if (isValidObjectId(trimmedOrder)) {
        payload.relatedOrderId = trimmedOrder;
      } else {
        payload.relatedOrderReference = trimmedOrder;
      }
    }

    if (trimmedShop) {
      if (isValidObjectId(trimmedShop)) {
        payload.relatedShopId = trimmedShop;
      } else {
        payload.relatedShopReference = trimmedShop;
      }
    }

    await onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('form.title')}</h2>
            <p className="mt-1 text-sm text-gray-500">{t('form.subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <span className="sr-only">{t('form.cancel')}</span>
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="ticket-title">
              {t('form.fields.title')} <span className="text-red-500">*</span>
            </label>
            <input
              id="ticket-title"
              value={formValues.title}
              onChange={(event) => handleChange('title', event.target.value)}
              required
              maxLength={120}
              placeholder={t('form.placeholders.title')}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="ticket-type">
                {t('form.fields.type')}
              </label>
              <select
                id="ticket-type"
                value={formValues.type}
                onChange={(event) => handleChange('type', event.target.value as TicketType)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              >
                {TICKET_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`types.${type}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="ticket-priority">
                {t('form.fields.priority')}
              </label>
              <select
                id="ticket-priority"
                value={formValues.priority}
                onChange={(event) => handleChange('priority', event.target.value as TicketPriority)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {t(`priorities.${priority}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="ticket-order">
                {t('form.fields.relatedOrder')}
              </label>
              <input
                id="ticket-order"
                value={formValues.relatedOrderId}
                onChange={(event) => handleChange('relatedOrderId', event.target.value)}
                placeholder={t('form.placeholders.relatedOrder')}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="ticket-shop">
                {t('form.fields.relatedShop')}
              </label>
              <input
                id="ticket-shop"
                value={formValues.relatedShopId}
                onChange={(event) => handleChange('relatedShopId', event.target.value)}
                placeholder={t('form.placeholders.relatedShop')}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="ticket-description">
              {t('form.fields.description')}
            </label>
            <textarea
              id="ticket-description"
              value={formValues.description}
              onChange={(event) => handleChange('description', event.target.value)}
              placeholder={t('form.placeholders.description')}
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{t('form.disclaimer')}</span>
            <span>{t('form.requiredHint')}</span>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              disabled={isSubmitting}
            >
              {t('form.cancel')}
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              )}
              {t('form.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoadingState: React.FC<{ t: TranslationFn }> = ({ t }) => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-orange-400 border-t-transparent"></div>
      <p className="text-sm text-gray-500">{t('loading')}</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void; t: TranslationFn }> = ({ error, onRetry, t }) => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="rounded-2xl bg-white px-8 py-10 text-center shadow-lg">
      <Image src={ICONS.VERIFIED} alt="Error" width={96} height={96} className="mx-auto mb-5 h-20 w-20" />
      <h2 className="text-xl font-semibold text-gray-900">{t('error')}</h2>
      <p className="mt-2 text-sm text-gray-500">{error}</p>
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
      >
        {t('retry')}
      </button>
    </div>
  </div>
);
