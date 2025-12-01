import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/shared/constants/api';
import { SupportChatMessage, SupportChatThread } from '@/domain/entities/Support';

export type SupportChatSocketStatus = 'disconnected' | 'connecting' | 'connected';

interface SocketMessagePayload {
  summary?: Partial<SupportChatThread> & { userId?: string };
  message?: {
    id?: string;
    sender?: string;
    senderName?: string | null;
    senderRole?: string | null;
    content?: string;
    createdAt?: string;
  };
}

interface UseSupportChatSocketOptions {
  userId: string | null;
  onMessage?: (payload: { message: SupportChatMessage; summary?: Partial<SupportChatThread> }) => void;
  onThreadUpdate?: (summary: Partial<SupportChatThread>) => void;
  onStatusChange?: (status: SupportChatSocketStatus) => void;
}

const buildMessage = (raw?: SocketMessagePayload['message']): SupportChatMessage => ({
  id: raw?.id ?? `${Date.now().toString(32)}-${Math.random().toString(36).slice(2, 8)}`,
  sender: raw?.sender === 'admin' ? 'admin' : 'user',
  senderName: raw?.senderName ?? null,
  senderRole: (raw?.senderRole as 'user' | 'admin' | null) ?? null,
  content: raw?.content ?? '',
  createdAt: raw?.createdAt ? new Date(raw.createdAt) : new Date()
});

const buildSummary = (summary?: Partial<SupportChatThread>) => {
  if (!summary) return undefined;
  const rawLastMessageAt = summary.lastMessageAt as unknown;
  let lastMessageAt: Date | null = null;
  if (rawLastMessageAt instanceof Date) {
    lastMessageAt = rawLastMessageAt;
  } else if (typeof rawLastMessageAt === 'string') {
    const parsed = new Date(rawLastMessageAt);
    lastMessageAt = Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return {
    ...summary,
    lastMessageAt
  } as Partial<SupportChatThread>;
};

export const useSupportChatSocket = ({
  userId,
  onMessage,
  onThreadUpdate,
  onStatusChange
}: UseSupportChatSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }
    const socketUrl = API_CONFIG.SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : undefined);
    const socket = io(socketUrl ?? undefined, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    onStatusChange?.('connecting');

    socket.on('connect', () => {
      onStatusChange?.('connected');
      socket.emit('support-chat:join', { userId });
    });

    socket.on('disconnect', () => {
      onStatusChange?.('disconnected');
    });

    socket.on('support-chat:new-message', (payload: SocketMessagePayload) => {
      if (!payload?.summary?.userId || payload.summary.userId !== userId) {
        return;
      }
      if (!payload.message) {
        return;
      }
      const summary = buildSummary(payload.summary);
      onMessage?.({
        message: buildMessage(payload.message),
        summary,
      });
    });

    socket.on('support-chat:thread-update', (summary: Partial<SupportChatThread>) => {
      if (!summary?.userId || summary.userId !== userId) {
        return;
      }
      onThreadUpdate?.(buildSummary(summary) ?? {});
    });

    return () => {
      socket.emit('support-chat:leave', { userId });
      socket.disconnect();
      onStatusChange?.('disconnected');
    };
  }, [userId, onMessage, onStatusChange, onThreadUpdate]);
};
