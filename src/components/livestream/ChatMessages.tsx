"use client";

import React from 'react';
import { ChatMessage } from './ChatBox';
import { useTranslations } from 'next-intl';


interface ChatMessagesProps {
  messages: ChatMessage[];
  currentUserName: string;
  transparent?: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, currentUserName, transparent }) => {
  const t = useTranslations('livestream');

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const normalizedMessages = messages.slice().reverse();

  if (normalizedMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        <p className="text-center">
          {t('chatBox.empty')} 
        </p>
      </div>
    );
  }

  const containerStyle = transparent ? { maxHeight: 'calc(54vh - 6rem)' } : { maxHeight: '400px' };

  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide ${transparent ? 'pt-20 sm:pt-4' : ''}`} style={containerStyle}>
      <div />
      {normalizedMessages.map((msg) => {
        const isOwnMessage = msg.userName === currentUserName;
        return (
          <div key={msg.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 ${isOwnMessage ? 'bg-blue-500/50 text-white' : 'bg-gray-700/40 text-white'}`}>
              {!isOwnMessage && (
                <div className="text-xs font-semibold mb-1 text-blue-300">
                  {msg.userName}
                </div>
              )}
              <p className="text-sm break-words">{msg.message}</p>
              <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'}`}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessages;
