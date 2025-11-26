 'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ORDER_CONFIG } from '../config/orderConfig';
import { ICONS } from '../../shared/constants/images';

 

interface CancelOrderDialogProps {
  isOpen: boolean;
  orderNumber: string;
  isLoading: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  error?: string | null;
}

export const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  isOpen,
  orderNumber,
  isLoading,
  onConfirm,
  onClose,
  error,
}) => {
  const t = useTranslations('orders');
  const [reason, setReason] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClose = () => {
    setReason('');
    setLocalError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setLocalError(t('validation.reasonRequired'));
      return;
    }

    if (reason.length < ORDER_CONFIG.CANCEL_REASON_MIN_LENGTH) {
      setLocalError(t('validation.reasonTooShort'));
      return;
    }

    if (reason.length > ORDER_CONFIG.CANCEL_REASON_MAX_LENGTH) {
      setLocalError(t('validation.reasonTooLong'));
      return;
    }

    onConfirm(reason);
    if (!error) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('dialog.cancelTitle')}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('dialog.cancelSubtitle')} #{orderNumber}</p>
        </div>

        
        <div className="mb-4 rounded-lg bg-orange-50 p-3">
          <p className="text-sm text-orange-700 flex items-start gap-2">
            <Image src={ICONS.WARNING} alt={t('dialog.warningAlt')} width={20} height={20} className="w-5 h-5 flex-shrink-0" unoptimized />
            <span>{t('dialog.cancelWarning')}</span>
          </p>
        </div>

        
        <div className="mb-4">
          <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700">
            {t('dialog.reasonLabel')} *
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setLocalError(null);
            }}
            placeholder={t('dialog.reasonPlaceholder')}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            rows={4}
            disabled={isLoading}
            maxLength={ORDER_CONFIG.CANCEL_REASON_MAX_LENGTH}
          />
          <div className="mt-1 text-xs text-gray-500">
            {reason.length}/{ORDER_CONFIG.CANCEL_REASON_MAX_LENGTH} {t('dialog.characters')}
          </div>
        </div>

        
        {(localError || error) && (
          <div className="mb-4 rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-600 flex items-start gap-2">
              <Image src={ICONS.CROSS} alt={t('dialog.errorAlt')} width={18} height={18} className="w-4 h-4 flex-shrink-0" unoptimized />
              <span>{localError || error}</span>
            </p>
          </div>
        )}

        
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {t('dialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                {t('dialog.cancelling')}
              </span>
              ) : (
                t('dialog.confirmCancel')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
