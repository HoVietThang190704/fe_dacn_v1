import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { TICKET_TYPES, PRIORITIES } from './constants';
import { isValidObjectId } from './utils';
import type { CreateSupportTicketInput, TicketType } from '@/domain/entities/Support';
import { TicketPriority } from '@/domain/entities/Support';

type TranslationFn = (key: string, values?: Record<string, string | number | Date>) => string;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateSupportTicketInput & { relatedOrderId?: string; relatedShopId?: string }) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  t: TranslationFn;
};

export const CreateTicketModal: React.FC<Props> = ({ open, onClose, onSubmit, isSubmitting, error, t }) => {
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    type: 'support' as TicketType,
    priority: TicketPriority.MEDIUM,
    relatedOrderId: '',
    relatedShopId: '',
  });

  useEffect(() => {
    if (!open) {
      setFormValues({ title: '', description: '', type: 'support', priority: TicketPriority.MEDIUM, relatedOrderId: '', relatedShopId: '' });
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
      priority: formValues.priority as TicketPriority,
      isPublic: true,
    };

    if (trimmedOrder) {
      if (isValidObjectId(trimmedOrder)) payload.relatedOrderId = trimmedOrder;
      else payload.relatedOrderReference = trimmedOrder;
    }

    if (trimmedShop) {
      if (isValidObjectId(trimmedShop)) payload.relatedShopId = trimmedShop;
      else payload.relatedShopReference = trimmedShop;
    }

    await onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[100vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('form.title')}</h2>
            <p className="mt-1 text-sm text-gray-500">{t('form.subtitle')}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700">
            <Image src={ICONS.CROSS} alt={t('icons.closeAlt')} width={16} height={16} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-6 py-5">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="ticket-title">
              {t('form.fields.title')} <span className="text-red-500">*</span>
            </label>
            <input id="ticket-title" value={formValues.title} onChange={(e) => handleChange('title', e.target.value)} required maxLength={120} placeholder={t('form.placeholders.title')} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="ticket-type">{t('form.fields.type')}</label>
              <select id="ticket-type" value={formValues.type} onChange={(e) => handleChange('type', e.target.value as TicketType)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300">
                {TICKET_TYPES.map((type) => (<option key={type} value={type}>{t(`types.${type}`)}</option>))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="ticket-priority">{t('form.fields.priority')}</label>
              <select id="ticket-priority" value={formValues.priority} onChange={(e) => handleChange('priority', e.target.value as TicketPriority)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300">
                {PRIORITIES.map((priority) => (<option key={priority} value={priority}>{t(`priorities.${priority}`)}</option>))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="ticket-order">{t('form.fields.relatedOrder')}</label>
              <input id="ticket-order" value={formValues.relatedOrderId} onChange={(e) => handleChange('relatedOrderId', e.target.value)} placeholder={t('form.placeholders.relatedOrder')} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="ticket-shop">{t('form.fields.relatedShop')}</label>
              <input id="ticket-shop" value={formValues.relatedShopId} onChange={(e) => handleChange('relatedShopId', e.target.value)} placeholder={t('form.placeholders.relatedShop')} className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="ticket-description">{t('form.fields.description')}</label>
            <textarea id="ticket-description" value={formValues.description} onChange={(e) => handleChange('description', e.target.value)} placeholder={t('form.placeholders.description')} rows={5} className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300" />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{t('form.disclaimer')}</span>
            <span>{t('form.requiredHint')}</span>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100" disabled={isSubmitting}>{t('form.cancel')}</button>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300" disabled={isSubmitting}>
              {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {t('form.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
