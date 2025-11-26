import Image from 'next/image';
import React from 'react';
import { statusStyles, priorityIndicator } from './constants';
import { formatDate } from './utils';
import { ICONS } from '@/shared/constants/images';

import type { SupportTicket } from '@/domain/entities/Support';

type TranslationFn = (key: string, values?: Record<string, string | number | Date>) => string;

type Props = {
  ticket: SupportTicket;
  t: TranslationFn;
  locale: string;
};

export const TicketCard: React.FC<Props> = ({ ticket, t, locale }) => {
  const statusLabel = t(`statuses.${ticket.status}`);
  const priorityLabel = t(`priorities.${ticket.priority}`);
  const typeLabel = t(`types.${ticket.type}`);

  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">#{ticket.ticketNumber || ticket.id.slice(0, 8)}</span>
            <span className={`rounded-full px-3 py-1 ${statusStyles[ticket.status]}`}>{statusLabel}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-gray-600 shadow-inner">
              <span className={`h-2.5 w-2.5 rounded-full ${priorityIndicator[ticket.priority]} bg-current`} />
              {priorityLabel}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-gray-900">{ticket.title}</h3>
          {ticket.description && <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">{ticket.description}</p>}
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>{t('tickets.createdAt', { date: formatDate(ticket.createdAt, locale) })}</p>
          <p>{t('tickets.updatedAt', { date: formatDate(ticket.updatedAt, locale) })}</p>
        </div>
      </header>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">{typeLabel}</span>
          {typeof ticket.commentsCount === 'number' && (
            <span className="inline-flex items-center gap-1">
              <Image src={ICONS.QUOTE_REQUEST} alt={t('tickets.comments', { count: ticket.commentsCount })} width={16} height={16} />
              {t('tickets.comments', { count: ticket.commentsCount })}
            </span>
          )}
        </div>
        <button className="inline-flex items-center gap-2 font-medium text-orange-500 transition hover:text-orange-600">
          <span>{t('viewDetails')}</span>
          <Image src={ICONS.ARROW_RIGHT} alt={t('icons.arrowAlt') ?? ''} width={18} height={18} />
        </button>
      </footer>
    </article>
  );
};

export default TicketCard;
