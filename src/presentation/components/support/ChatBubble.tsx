import React from 'react';
import { SupportChatMessage } from '@/domain/entities/Support';
import { formatDate } from './utils';

type Props = {
  message: SupportChatMessage;
  locale: string;
};

export const ChatBubble: React.FC<Props> = ({ message, locale }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`mb-3 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          isUser
            ? 'rounded-br-sm bg-gradient-to-r from-green-100/95 to-green-200/95 text-black shadow-md'
            : 'rounded-bl-sm bg-white text-black border border-gray-100'
        }`}
      >
        <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
        <span className={`mt-2 block text-xs ${isUser ? 'text-black-100/80' : 'text-gray-400'}`}>
          {formatDate(message.createdAt, locale)}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
