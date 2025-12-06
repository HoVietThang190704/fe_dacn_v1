import { useCallback, useEffect, useMemo, useState } from 'react';
import { GetSupportChatThreadUseCase } from '@/domain/usecases/GetSupportChatThreadUseCase';
import { SendSupportChatMessageUseCase } from '@/domain/usecases/SendSupportChatMessageUseCase';
import { MarkSupportChatThreadReadUseCase } from '@/domain/usecases/MarkSupportChatThreadReadUseCase';
import { SupportChatMessage, SupportChatThread } from '@/domain/entities/Support';
import { useSupportChatSocket, SupportChatSocketStatus } from '@/presentation/hooks/useSupportChatSocket';

const UNAUTHORIZED_PATTERNS = ['token', 'unauthorized', 'đăng nhập', 'expired'];

interface UseSupportChatViewModelOptions {
  greeting?: string;
}

export const useSupportChatViewModel = (
  getThreadUseCase: GetSupportChatThreadUseCase,
  sendMessageUseCase: SendSupportChatMessageUseCase,
  markThreadReadUseCase: MarkSupportChatThreadReadUseCase,
  options: UseSupportChatViewModelOptions
) => {
  const [thread, setThread] = useState<SupportChatThread | null>(null);
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [isSending, setSending] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SupportChatSocketStatus>('disconnected');

  const greetingMessage = useMemo<SupportChatMessage | null>(() => {
    if (!options.greeting) {
      return null;
    }
    return {
      id: 'support-greeting',
      sender: 'system',
      senderName: null,
      senderRole: null,
      content: options.greeting,
      createdAt: new Date()
    };
  }, [options.greeting]);

  const displayMessages = useMemo(() => {
    if (messages.length > 0) {
      return messages;
    }
    return greetingMessage ? [greetingMessage] : [];
  }, [messages, greetingMessage]);

  const redirectToLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const updateMessages = useCallback((incoming: SupportChatMessage) => {
    setMessages((prev) => {
      if (prev.some((msg) => msg.id === incoming.id)) {
        return prev;
      }
      return [...prev, incoming].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    });
  }, []);

  const handleUnauthorized = useCallback((message: string | null) => {
    if (!message) return false;
    const matched = UNAUTHORIZED_PATTERNS.some((pattern) => message.toLowerCase().includes(pattern));
    if (matched) {
      setRequiresAuth(true);
    }
    return matched;
  }, []);

  const fetchThread = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await getThreadUseCase.execute();
      setThread(data);
      setMessages(data?.messages ?? []);
      setRequiresAuth(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const unauthorized = handleUnauthorized(message);
      setLoadError(unauthorized ? null : message);
      if (!unauthorized) {
        setThread(null);
        setMessages([]);
      }
    } finally {
      setLoading(false);
    }
  }, [getThreadUseCase, handleUnauthorized]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  const markAsRead = useCallback(async () => {
    try {
      const updated = await markThreadReadUseCase.execute();
      if (updated) {
        setThread((current) => (current ? { ...current, unreadByUser: updated.unreadByUser } : current));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      handleUnauthorized(message);
    }
  }, [markThreadReadUseCase, handleUnauthorized]);

  useEffect(() => {
    if (!isChatOpen) return;
    if (!thread) return;
    if ((thread.unreadByUser ?? 0) === 0) return;
    markAsRead();
  }, [isChatOpen, thread, markAsRead]);

  const handleIncomingMessage = useCallback((payload: { message: SupportChatMessage; summary?: Partial<SupportChatThread> }) => {
    setThread((current) => {
      if (!current) {
        return payload.summary ? { ...payload.summary, messages: [] } as SupportChatThread : current;
      }
      return {
        ...current,
        ...payload.summary,
      } as SupportChatThread;
    });
    updateMessages(payload.message);
    if (isChatOpen && payload.message.sender !== 'user') {
      markAsRead();
    }
  }, [isChatOpen, markAsRead, updateMessages]);

  const handleThreadUpdate = useCallback((summary: Partial<SupportChatThread>) => {
    setThread((current) => (current ? { ...current, ...summary } : current));
  }, []);

  useSupportChatSocket({
    userId: thread?.userId ?? null,
    onMessage: handleIncomingMessage,
    onThreadUpdate: handleThreadUpdate,
    onStatusChange: setSocketStatus,
  });

  const openChat = useCallback(() => {
    if (requiresAuth) {
      redirectToLogin();
      return;
    }
    setChatOpen(true);
    if (!thread) {
      fetchThread();
    }
  }, [requiresAuth, thread, fetchThread]);

  const closeChat = useCallback(() => {
    setChatOpen(false);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;
    if (requiresAuth) {
      redirectToLogin();
      return;
    }
    setSending(true);
    try {
      const result = await sendMessageUseCase.execute(chatInput);
      setThread(result.thread);
      updateMessages(result.message);
      setChatInput('');
      if (isChatOpen) {
        markAsRead();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const unauthorized = handleUnauthorized(message);
      if (!unauthorized) {
        setLoadError(message);
      }
    } finally {
      setSending(false);
    }
  }, [chatInput, sendMessageUseCase, handleUnauthorized, updateMessages, markAsRead, isChatOpen, requiresAuth]);

  return {
    thread,
    messages: displayMessages,
    rawMessages: messages,
    chatInput,
    setChatInput,
    isChatOpen,
    openChat,
    closeChat,
    isLoading,
    loadError,
    isSending,
    sendMessage,
    requiresAuth,
    socketStatus,
    unreadCount: thread?.unreadByUser ?? 0,
    refresh: fetchThread,
  };
};
