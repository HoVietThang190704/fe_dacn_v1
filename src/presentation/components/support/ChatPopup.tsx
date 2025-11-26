import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { ICONS } from '@/shared/constants/images';
import { ChatBubble } from './ChatBubble';

type ChatMessage = {
  id: string;
  author: 'user' | 'system';
  content: string;
  timestamp: Date;
};

type Props = {
  open: boolean;
  onClose: () => void;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  messages: ChatMessage[];
  locale: string;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
};

export const ChatPopup: React.FC<Props> = ({ open, onClose, t, messages, locale, chatInput, onChatInputChange, onSend }) => {
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

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
    onSend();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={handleOverlayClick}>
      <div className="relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl md:my-8 md:h-[90vh] md:w-[420px] md:rounded-l-3xl md:rounded-r-none" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('chatBox.title')}</h2>
            <p className="text-xs text-gray-500">{t('chatBox.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{t('chatBox.betaTag')}</span>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
              <Image src={ICONS.CROSS} alt={t('icons.closeAlt')} width={16} height={16} />
            </button>
          </div>
        </header>

        <div ref={messagesRef} className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
          {messages.length === 0 ? (
            <p className="mt-10 text-center text-sm text-gray-500">{t('chatBox.empty')}</p>
          ) : (
            messages.map((message) => <ChatBubble key={message.id} message={message} locale={locale} />)
          )}
        </div>

        <div className="border-t border-gray-100 bg-white px-5 py-4">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <textarea value={chatInput} onChange={(event) => onChatInputChange(event.target.value)} placeholder={t('chatBox.placeholder')} className="h-28 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300" />
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-gray-400">
                <p className="font-semibold text-gray-600">{t('chatBox.noteTitle')}</p>
                <p className="mt-1 max-w-xs leading-relaxed text-gray-500">{t('chatBox.noteContent')}</p>
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300" disabled={!chatInput.trim()}>
                <Image src={ICONS.ARROW_RIGHT} alt={t('icons.sendAlt')} width={18} height={18} />
                <span>{t('chatBox.send')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
