'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useAuth } from '@/shared/hooks/useAuth';

interface CreatePostPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, images?: File[]) => Promise<void>;
  isLoading: boolean;
}

export const CreatePostPopup: React.FC<CreatePostPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const t = useTranslations('community');
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = useCallback((files: File[]) => {
    if (files.length + images.length > 10) {
      alert(t('maxImages') || 'Maximum 10 images allowed');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  }, [images, t]);

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleImageSelect(files);
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

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    handleImageSelect(files);
  }, [handleImageSelect]);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      alert(t('emptyPost') || 'Please enter content or select images');
      return;
    }

    try {
      await onSubmit(content, images);
      setContent('');
      setImages([]);
      setImagePreviews([]);
      onClose();
    } catch {
      // Error is handled in the parent component
    }
  };

  const handleClose = () => {
    setContent('');
    setImages([]);
    setImagePreviews([]);
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;
  
  const userName = user?.userName || 'Người dùng';
  const userAvatar = user?.avatar;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header - Facebook style */}
        <div className="relative p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 text-center">{t('createPost') || 'Tạo bài viết'}</h2>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 w-9 h-9 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* User Info - Facebook style */}
            <div className="flex items-center gap-3 mb-3">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(userName)}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-[15px]">{userName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <button className="flex items-center gap-1 px-2 py-0.5 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium text-gray-700 transition-colors">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    Công khai
                  </button>
                </div>
              </div>
            </div>

            {/* Text Input */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`${userName} ơi, bạn đang nghĩ gì thế?`}
                className="w-full px-0 py-2 text-[15px] resize-none focus:outline-none text-gray-900 placeholder-gray-500 min-h-[150px]"
                maxLength={2000}
                autoFocus
              />
              {content.length > 1800 && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {content.length}/2000
                </div>
              )}
            </div>

            {/* Image Previews - Enhanced Grid Layout */}
            {imagePreviews.length > 0 && (
              <div className="border border-gray-300 rounded-lg p-2 relative">
                <button
                  onClick={() => {
                    setImages([]);
                    setImagePreviews([]);
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-md transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className={`grid gap-2 ${
                  imagePreviews.length === 1 ? 'grid-cols-1' :
                  imagePreviews.length === 2 ? 'grid-cols-2' :
                  imagePreviews.length === 3 ? 'grid-cols-3' :
                  imagePreviews.length === 4 ? 'grid-cols-2' :
                  imagePreviews.length >= 5 ? 'grid-cols-3' :
                  'grid-cols-2'
                }`}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className={`relative overflow-hidden rounded ${
                        imagePreviews.length === 1 ? 'aspect-video' : 'aspect-square'
                      }`}>
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{imagePreviews.length}/10 ảnh</span>
                  {imagePreviews.length < 10 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      + Thêm ảnh
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Image Upload Area - Only show when no images */}
            {imagePreviews.length === 0 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isDragging ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[15px] font-medium text-gray-900">
                    {isDragging ? 'Thả ảnh vào đây' : 'Thêm ảnh'}
                  </p>
                  <p className="text-xs text-gray-500">Chọn nhiều ảnh cùng lúc (tối đa 10)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Simplified */}
        <div className="p-4 border-t border-gray-200">
          {/* Post button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!content.trim() && images.length === 0)}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500 transition-colors font-semibold text-[15px] flex items-center justify-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isLoading ? 'Đang đăng...' : 'Đăng'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add animations to globals.css if not already present
// @keyframes fadeIn {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
// @keyframes slideUp {
//   from { transform: translateY(20px); opacity: 0; }
//   to { transform: translateY(0); opacity: 1; }
// }
// .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
// .animate-slideUp { animation: slideUp 0.3s ease-out; }