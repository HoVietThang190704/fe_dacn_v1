'use client';

import React, { useRef, useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserName: string;
  viewerCount: number;
  className?: string;
  transparent?: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, currentUserName, viewerCount, className, transparent }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesStartRef = useRef<HTMLDivElement>(null);


  const handleSend = () => {
    const trimmed = inputMessage.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputMessage('');
  };

  return (
    <div className={`flex flex-col h-full ${transparent ? 'bg-transparent' : 'bg-gray-800'} rounded-xl ${className || ''}`}>
      <ChatHeader viewerCount={viewerCount} hideOnMobile={!!transparent} />
      <div className="flex-1">
        <div ref={messagesStartRef} />
        <ChatMessages messages={messages} currentUserName={currentUserName} transparent={transparent} />
      </div>
      <ChatInput value={inputMessage} onChange={setInputMessage} onSend={handleSend} maxLength={200} transparent={transparent} />
    </div>
  );
};

export default ChatBox;

