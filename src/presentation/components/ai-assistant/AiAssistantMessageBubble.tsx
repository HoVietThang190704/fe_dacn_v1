'use client';

import { AiAssistantMessage } from '@/domain/entities/AiAssistant';
import clsx from 'clsx';

interface Props {
  message: AiAssistantMessage;
  translate: (key: string) => string;
}

export const AiAssistantMessageBubble: React.FC<Props> = ({ message, translate }) => {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('flex w-full text-sm', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[92%] rounded-3xl px-4 py-3 shadow-sm transition',
          isUser
            ? 'rounded-br-md bg-gradient-to-r from-green-50 to-green-100 text-black'
            : 'rounded-bl-md border border-green-200 bg-white text-gray-800'
        )}
      >
        {message.status === 'pending' ? (
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '0.15s' }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '0.3s' }} />
          </div>
        ) : (
          <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
        )}

       
      </div>
    </div>
  );
};

export default AiAssistantMessageBubble;
