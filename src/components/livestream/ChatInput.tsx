"use client";

import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  maxLength?: number;
  transparent?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, maxLength = 200, transparent }) => {
  const t = useTranslations('livestream');
  const charCount = `${value.length}/${maxLength} ${t('chatBox.characters')}`;
  const sendIcon = ICONS.ARROW_RIGHT ?? ICONS.PLACEHOLDER;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`p-4 border-t ${transparent ? 'border-gray-700/40' : 'border-gray-700'}`}>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('chatBox.placeholder')}
          className={`flex-1 ${transparent ? 'bg-white/10 placeholder-white/70 text-white' : 'bg-gray-700 text-white'} px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
          maxLength={maxLength}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Image src={sendIcon} alt={t('chatBox.send')} width={18} height={18} unoptimized />
          <span className="sr-only">{t('chatBox.send')}</span>
        </button>
      </div>
      <p className={`${transparent ? 'text-white/70' : 'text-gray-500'} text-xs mt-2`}>{charCount}</p>
    </form>
  );
};

export default ChatInput;
