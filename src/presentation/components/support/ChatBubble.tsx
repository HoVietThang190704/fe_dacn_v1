import React from 'react';
import { formatDate } from './utils';

type ChatMessage = {
  id: string;
  author: 'user' | 'system';
  content: string;
  timestamp: Date;
};

type Props = {
  message: ChatMessage;
  locale: string;
};

export const ChatBubble: React.FC<Props> = ({ message, locale }) => {
  const isUser = message.author === 'user';
  return (
    <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isUser ? 'rounded-br-sm bg-orange-500 text-white' : 'rounded-bl-sm bg-white text-gray-700'
        }`}
      >
        <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
        <span className={`mt-2 block text-xs ${isUser ? 'text-orange-100/80' : 'text-gray-400'}`}>
          {formatDate(message.timestamp, locale)}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
