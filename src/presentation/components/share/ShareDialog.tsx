'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ShareResourceType } from '@/domain/entities/ShareInfo';
import { useShareInfo } from '@/presentation/hooks/useShareInfo';
import { ICONS } from '@/shared/constants/images';

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  resourceType: ShareResourceType;
  resourceId: string;
  locale?: string;
  onInternalShare?: (content?: string) => Promise<void>;
}

type CopyStatus = 'idle' | 'success' | 'error';

export function ShareDialog({
  open,
  onClose,
  resourceType,
  resourceId,
  locale,
  // onInternalShare (internal sharing) is not currently active in the UI
}: ShareDialogProps) {
  const t = useTranslations('shareDialog');
  const { shareInfo, isLoading, error, refresh } = useShareInfo({
    resourceType,
    resourceId,
    locale,
    enabled: open,
  });
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  const title = useMemo(() => t(`title.${resourceType}` as const), [t, resourceType]);
  const subtitle = useMemo(() => t(`subtitle.${resourceType}` as const), [t, resourceType]);
  const fallbackTitle = useMemo(() => t(`metaFallback.${resourceType}` as const), [t, resourceType]);
  const closeLabel = t('close');
  const qrAlt = t('qrLabel');

  const resetTransientState = useCallback(() => {
    setCopyStatus('idle');
  }, []);

  useEffect(() => {
    if (!open) {
      resetTransientState();
    }
  }, [open, resetTransientState, resourceId]);

  const runCopy = useCallback(async () => {
    if (!shareInfo?.shareUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareInfo.shareUrl);
      } else {
        const tempInput = document.createElement('textarea');
        tempInput.value = shareInfo.shareUrl;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopyStatus('success');
      window.setTimeout(() => setCopyStatus('idle'), 2500);
    } catch {
      setCopyStatus('error');
      window.setTimeout(() => setCopyStatus('idle'), 3000);
    }
  }, [shareInfo]);

  // NOTE: internal share UI is not currently active (no textarea/button), so we don't
  // include the transient sharing state here to avoid unused variable warnings.

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-0 md:px-4 py-0 md:py-6 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="w-full h-full max-w-none rounded-none bg-white shadow-2xl flex flex-col overflow-hidden md:max-w-2xl md:rounded-3xl md:h-auto md:max-h-[calc(100vh-4rem)]">
        <header className="flex items-center justify-between border-b border-gray-100 px-4 md:px-6 py-4">
          <div className="flex items-center gap-2">
            <Image src={ICONS.SHARE ?? ICONS.PLACEHOLDER} alt={title} width={28} height={28} />
            <div>
              <p className="text-base font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-gray-100"
            aria-label={closeLabel}
          >
            <Image src={ICONS.CROSS ?? ICONS.PLACEHOLDER} alt={closeLabel} width={16} height={16} />
          </button>
        </header>

        <section className="flex-1 overflow-y-auto space-y-4 px-4 md:px-6 py-5">
          {isLoading && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              {t('loading')}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              <p>{error || t('error')}</p>
              <button
                type="button"
                onClick={() => refresh()}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-100"
              >
                <Image src={ICONS.WARNING ?? ICONS.PLACEHOLDER} alt={t('retry')} width={16} height={16} />
                {t('retry')}
              </button>
            </div>
          )}

          {!isLoading && !error && shareInfo && (
            <div className="grid gap-2 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="flex flex-col gap-1">
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('preview')}</p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {shareInfo.meta?.title || fallbackTitle}
                      </p>
                      {shareInfo.meta?.description && (
                        <p className="mt-1 text-sm text-gray-600">{shareInfo.meta.description}</p>
                      )}
                    </div>
                    {shareInfo.meta?.thumbnail && (
                      <div className="relative h-24 w-32 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                        <Image
                          src={shareInfo.meta.thumbnail}
                          alt={shareInfo.meta.title || fallbackTitle}
                          fill
                          className="object-cover"
                          sizes="128px"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {t('linkLabel')}
                  </label>
                  <div className="mt-2 flex flex-col gap-1 ">
                    <input
                      type="text"
                      readOnly
                      value={shareInfo.shareUrl}
                      className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={runCopy}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-100 px-4 py-2 text-sm font-semibold text-black transition hover:bg-green-200 sm:flex-initial"
                      >
                        <Image src={ICONS.COPY} alt={t('copyAction')} width={16} height={16} />
                        {t('copyAction')}
                      </button>
                      <a
                        href={shareInfo.shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:text-gray-900 sm:flex-initial"
                      >
                        <Image src={ICONS.DIRECT} alt={t('openAction')} width={16} height={16} />
                        {t('openAction')}
                      </a>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {copyStatus === 'success' && t('copySuccess')}
                    {copyStatus === 'error' && t('copyError')}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t('qrLabel')}</p>
                <div className="mt-4 flex flex-col items-center gap-3">
                  <Image
                    src={shareInfo.qrCodeDataUrl}
                    alt={qrAlt}
                    width={220}
                    height={220}
                    className="rounded-2xl border border-gray-200 bg-white p-3"
                    unoptimized
                  />
                  <p className="text-xs text-gray-500">{t('scanHint')}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
