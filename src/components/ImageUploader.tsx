"use client";

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ICONS } from '@/shared/constants/images';
import { API_CONFIG } from '@/shared/constants/api';

interface ImageUploaderProps {
  initialUrls?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  i18nNamespace?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ initialUrls = [], onChange, maxFiles = 8, i18nNamespace = 'imageUploader' }) => {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations(i18nNamespace);

  const notify = useCallback((next: string[]) => {
    setUrls(next);
    onChange?.(next);
  }, [onChange]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, Math.max(0, maxFiles - urls.length));
    if (fileArray.length === 0) return;

    if (!API_CONFIG.BASE_URL) {
      alert(t('uploadError', { error: 'Missing API_BASE_URL (set NEXT_PUBLIC_API_URL in deployment)' }));
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fileArray.forEach((f) => fd.append('images', f));
      const token = (typeof window !== 'undefined')
        ? (localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken'))
        : null;

      if (!token) {
        alert(t('loginRequired'));
        return;
      }

      const headers: Record<string, string> = {};
      headers['Authorization'] = `Bearer ${token}`;

      const apiBase = (API_CONFIG.BASE_URL || '').replace(/\/$/, '');
        const endpoint = `${apiBase}/api/upload/images`;
      const res = await fetch(endpoint, {
        method: 'POST',
        body: fd,
        credentials: 'include',
        headers,
      });
      if (!res.ok) {
        const text = await res.text();
        // Try to parse JSON error if possible
        try {
          const jsonErr = JSON.parse(text);
          alert(jsonErr.message || t('uploadFailed'));
        } catch {
          console.error('[ImageUploader] upload failed with non-JSON:', text);
          alert(t('uploadFailed'));
        }
        return;
      }

      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        console.error('[ImageUploader] Invalid response content-type from upload endpoint:', ct, text);
        alert(t('uploadFailed'));
        return;
      }

      const payload = await res.json();
      if (!res.ok) {
        alert(payload.message || t('uploadFailed'));
        return;
      }

      const returnedUrls: string[] = payload?.data?.urls || [];
      const next = [...urls, ...returnedUrls].slice(0, maxFiles);
      notify(next);
    } catch (e) {
      // Show a more friendly message when the result is not JSON (most likely misconfigured base URL)
      const errText = String(e);
      console.error('[ImageUploader] upload error:', errText);
      const friendly = t('uploadError', { error: errText });
      alert(friendly);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [maxFiles, urls, notify, t]);

  const handleRemove = async (index: number) => {
    const url = urls[index];
    try {
      const match = url.match(/\/fresh-food\/posts\/(.+?)\./);
      if (match && match[1]) {
        const publicId = match[1];
        const token = (typeof window !== 'undefined')
          ? (localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken'))
          : null;
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

          const apiBase = (API_CONFIG.BASE_URL || '').replace(/\/$/, '');
            const deleteEndpoint = `${apiBase}/api/upload/images/${encodeURIComponent(publicId)}`;
        await fetch(deleteEndpoint, {
          method: 'DELETE',
          credentials: 'include',
          headers,
        });
      }
    } catch {
    }

    const next = urls.filter((_, i) => i !== index);
    notify(next);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    handleFiles(dt.files);
  }, [handleFiles]);

  const remainingSlots = maxFiles - urls.length;

  const handleClickUpload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {remainingSlots > 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? 'bg-orange-100' : 'bg-gray-100'
            }`}>
              {ICONS.IMAGE || ICONS.PLACEHOLDER ? (
                <Image src={ICONS.IMAGE || ICONS.PLACEHOLDER} alt={t('uploadImage')} width={24} height={24} />
              ) : (
                <div className="w-6 h-6 text-gray-500" aria-hidden />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragging ? t('dropHere') : t('selectMultiple')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('hint', { maxFiles, remainingSlots })}
              </p>
            </div>

            {uploading && (
              <div className="w-full max-w-xs">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{t('uploading', { progress })}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {urls.length > 0 && (
        <div>
            <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              {t('selectedImages', { count: urls.length, max: maxFiles })}
            </p>
            {remainingSlots > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {ICONS.PLUS ? (
                  <Image src={ICONS.PLUS} alt={t('add')} width={14} height={14} />
                ) : (
                  <span className="font-bold">{t('add')}</span>
                )}
                <span className="ml-2">{t('add')}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {urls.map((url, idx) => (
              <div key={url + idx} className="relative group border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-square">
                  <Image
                    src={url}
                    alt={`Uploaded ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title={t('remove')}
                >
                  {ICONS.CROSS ? (
                    <Image src={ICONS.CROSS} alt={t('remove')} width={12} height={12} />
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
