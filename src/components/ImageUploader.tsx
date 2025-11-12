'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  initialUrls?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ initialUrls = [], onChange, maxFiles = 8 }) => {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((next: string[]) => {
    setUrls(next);
    onChange?.(next);
  }, [onChange]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, Math.max(0, maxFiles - urls.length));
    if (fileArray.length === 0) return;

    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fileArray.forEach((f) => fd.append('images', f));
      const token = (typeof window !== 'undefined')
        ? (localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken'))
        : null;

      if (!token) {
        alert('Vui lòng đăng nhập trước khi upload ảnh');
        return;
      }

      const headers: Record<string, string> = {};
      headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/upload/images', {
        method: 'POST',
        body: fd,
        credentials: 'include',
        headers,
      });

      const payload = await res.json();
      if (!res.ok) {
        console.error('Upload failed', payload);
        alert(payload.message || 'Upload lỗi');
        return;
      }

      const returnedUrls: string[] = payload?.data?.urls || [];
      const next = [...urls, ...returnedUrls].slice(0, maxFiles);
      notify(next);
    } catch (e) {
      console.error('Upload error', e);
      alert('Upload lỗi: ' + String(e));
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset input để có thể chọn lại cùng file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [maxFiles, urls, notify]);

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

        await fetch(`/api/upload/images/${encodeURIComponent(publicId)}`, {
          method: 'DELETE',
          credentials: 'include',
          headers,
        });
      }
    } catch (e) {
      console.warn('Could not delete remote image', e);
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
    // Create a FileList-like object
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
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragging ? 'Thả ảnh vào đây' : 'Chọn nhiều ảnh cùng lúc'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Kéo thả hoặc click để chọn • Tối đa {maxFiles} ảnh • Còn {remainingSlots} slot
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
                <p className="text-xs text-gray-600 mt-1">Đang upload... {progress}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {urls.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Ảnh đã chọn ({urls.length}/{maxFiles})
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
                + Thêm ảnh
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
                  title="Xóa ảnh"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
