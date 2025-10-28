'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface CreatePostPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  isLoading: boolean;
}

export const CreatePostPopup: React.FC<CreatePostPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const t = useTranslations('community');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = useCallback((files: File[]) => {
    if (files.length + images.length > 4) {
      alert(t('maxImages') || 'Maximum 4 images allowed');
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
      await onSubmit(content);
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
    setShowEmojiPicker(false);
    onClose();
  };

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const emojis = ['😀', '😂', '🥰', '😍', '🤔', '😮', '🙄', '😴', '👍', '👎', '❤️', '🔥', '🎉', '✨', '🌟', '💯'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('createPost')}</h2>
              <p className="text-sm text-gray-600">Chia sẻ trải nghiệm của bạn</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-semibold">
              A
            </div>
            <div>
              <p className="font-medium text-gray-900">Nguyễn Văn A</p>
              <p className="text-sm text-gray-500">Chia sẻ với cộng đồng</p>
            </div>
          </div>

          {/* Text Input */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('postPlaceholder') || "Hôm nay bạn muốn chia sẻ điều gì?"}
              className="w-full p-3 border border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-orange-300 outline-none transition-colors text-gray-900 placeholder-gray-500"
              rows={4}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="text-lg">😊</span>
              </button>
              <span className="text-sm text-gray-400">{content.length}/500</span>
            </div>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="bg-white border border-gray-200 rounded-md p-3">
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl hover:bg-gray-100 rounded p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 text-sm">Ảnh đã chọn ({imagePreviews.length}/4)</h3>
                <button
                  onClick={() => setImagePreviews([])}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-sm overflow-hidden border border-gray-200">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={120}
                        height={120}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white text-gray-700 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity border"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border border-dashed rounded-md p-3 text-center transition-colors ${
              isDragging ? 'border-orange-400 bg-white' : 'border-gray-300 hover:border-orange-400 bg-white'
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
            <div className="flex flex-col items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-orange-100' : 'bg-gray-100'}`}>
                <svg className={`w-5 h-5 text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  {isDragging ? 'Thả ảnh vào đây' : 'Thêm ảnh vào bài viết'}
                </p>
                <p className="text-sm text-gray-500">
                  Kéo thả hoặc nhấn để chọn (tối đa 4 ảnh)
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 border border-orange-500 text-orange-500 rounded-md hover:bg-orange-50 transition-colors text-sm font-medium"
                disabled={images.length >= 4}
              >
                Chọn ảnh
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Bài viết sẽ được chia sẻ công khai
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors font-medium"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (!content.trim() && images.length === 0)}
              className="px-6 py-2 bg-orange-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isLoading ? 'Đang đăng...' : 'Đăng bài'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};