'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { AiAssistantMessage } from '@/domain/entities/AiAssistant';
import { AskAiAssistantUseCase } from '@/domain/usecases/AskAiAssistantUseCase';

export type AiAssistantStatus = 'ready' | 'thinking' | 'failed';

interface Dependencies {
  askAiAssistantUseCase: AskAiAssistantUseCase;
}

interface Options {
  locale: string;
  greeting?: string;
  historyLimit?: number;
}

export const useAiAssistantViewModel = (
  { askAiAssistantUseCase }: Dependencies,
  { locale, greeting, historyLimit = 12 }: Options
) => {
  const [messages, setMessages] = useState<AiAssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<AiAssistantStatus>('ready');
  const [error, setError] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  const lastPromptRef = useRef<string | null>(null);

  const greetingMessage = useMemo<AiAssistantMessage | null>(() => {
    if (!greeting) return null;
    return {
      id: 'ai-assistant-greeting',
      role: 'assistant',
      content: greeting,
      createdAt: new Date(),
      status: 'ready',
    };
  }, [greeting]);

  const displayedMessages = useMemo(() => {
    if (!greetingMessage) return messages;
    return [greetingMessage, ...messages];
  }, [greetingMessage, messages]);

  const hasConversation = useMemo(() => messages.length > 0, [messages]);

  const buildHistoryPayload = useCallback(
    (source: AiAssistantMessage[]) =>
      source
        .filter((msg) => (msg.role === 'user' || msg.role === 'assistant') && msg.id !== 'ai-assistant-greeting')
        .map((msg) => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))
        .slice(-historyLimit),
    [historyLimit]
  );

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const togglePanel = useCallback(() => setPanelOpen((prev) => !prev), []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setCanRetry(false);
    setStatus('ready');
    setInputValue('');
    lastPromptRef.current = null;
  }, []);

  const handleAssistantSuccess = useCallback(
    (pendingId: string, answer: string, suggestions: AiAssistantMessage['suggestions']) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === pendingId
            ? {
                ...msg,
                content: answer,
                status: 'ready',
                createdAt: new Date(),
                suggestions,
              }
            : msg
        )
      );
      setStatus('ready');
      setError(null);
      setCanRetry(false);
      lastPromptRef.current = null;
    },
    []
  );

  const handleAssistantError = useCallback((pendingId: string, fallbackMessage: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== pendingId));
    setStatus('failed');
    setError(fallbackMessage);
    setCanRetry(true);
  }, []);

  const sendMessage = useCallback(async () => {
    const prompt = inputValue.trim();
    if (!prompt || isSending) return;

    const userMessage: AiAssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      createdAt: new Date(),
      status: 'ready',
    };

    const pendingId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pendingMessage: AiAssistantMessage = {
      id: pendingId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
      status: 'pending',
    };

    const historySource = [...messages, userMessage];

    lastPromptRef.current = prompt;
    setMessages((prev) => [...prev, userMessage, pendingMessage]);
    setInputValue('');
    setIsSending(true);
    setStatus('thinking');
    setError(null);
    setCanRetry(false);

    try {
      const response = await askAiAssistantUseCase.execute({
        message: prompt,
        locale,
        history: buildHistoryPayload(historySource),
      });
      handleAssistantSuccess(pendingId, response.answer, response.suggestions);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to contact the AI assistant right now.';
      handleAssistantError(pendingId, message);
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, messages, askAiAssistantUseCase, locale, buildHistoryPayload, handleAssistantError, handleAssistantSuccess]);

  const retry = useCallback(async () => {
    if (!lastPromptRef.current || isSending) return;
    const prompt = lastPromptRef.current;
    const pendingId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pendingMessage: AiAssistantMessage = {
      id: pendingId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
      status: 'pending',
    };

    const historySource = [...messages];

    setMessages((prev) => [...prev, pendingMessage]);
    setIsSending(true);
    setStatus('thinking');
    setError(null);
    setCanRetry(false);

    try {
      const response = await askAiAssistantUseCase.execute({
        message: prompt,
        locale,
        history: buildHistoryPayload(historySource),
      });
      handleAssistantSuccess(pendingId, response.answer, response.suggestions);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to contact the AI assistant right now.';
      handleAssistantError(pendingId, message);
    } finally {
      setIsSending(false);
    }
  }, [askAiAssistantUseCase, buildHistoryPayload, handleAssistantError, handleAssistantSuccess, isSending, locale, messages]);

  return {
    messages: displayedMessages,
    rawMessages: messages,
    inputValue,
    setInputValue,
    isPanelOpen,
    openPanel,
    closePanel,
    togglePanel,
    sendMessage,
    retry,
    canRetry,
    isSending,
    status,
    error,
    clearChat,
    hasConversation,
  };
};
