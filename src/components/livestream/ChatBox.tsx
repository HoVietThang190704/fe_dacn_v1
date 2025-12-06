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
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, currentUserName, viewerCount }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesStartRef = useRef<HTMLDivElement>(null);


  const handleSend = () => {
    const trimmed = inputMessage.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-xl">
      <ChatHeader viewerCount={viewerCount} />
      <div className="flex-1">
        <div ref={messagesStartRef} />
        <ChatMessages messages={messages} currentUserName={currentUserName} />
      </div>
      <ChatInput value={inputMessage} onChange={setInputMessage} onSend={handleSend} maxLength={200} />
    </div>
  );
};

export default ChatBox;

