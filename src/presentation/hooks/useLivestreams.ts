import React from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/shared/constants/api';
import { container } from '@/presentation/di/container';
import { Livestream } from '@/domain/entities/Livestream';
import { useTranslations } from 'next-intl';

export const useLivestreams = () => {
  const t = useTranslations('livestream');
  const [activeLivestreams, setActiveLivestreams] = React.useState<Livestream[]>([]);
  const [scheduledLivestreams, setScheduledLivestreams] = React.useState<Livestream[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadLivestreams = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const getLivestreamsUseCase = container.getLivestreamsUseCase;
      const data = await getLivestreamsUseCase.execute();
      setActiveLivestreams(data.active);
      setScheduledLivestreams(data.scheduled);
      setError('');
    } catch (err) {
      setError(t('errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  React.useEffect(() => {
    loadLivestreams();
  }, [loadLivestreams]);

  // Setup socket for realtime livestream updates
  React.useEffect(() => {
    const socketUrl = API_CONFIG.SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : undefined);
    if (!socketUrl) return;

    const socket: Socket = io(socketUrl ?? undefined, { transports: ['websocket', 'polling'] });

    const onNewLivestream = (payload: any) => {
      if (!payload?.id) return;
      try {
        const status = payload.status as string | undefined;
        // Ensure we don't duplicate
        setActiveLivestreams((prev) => {
          if (prev.some((p) => p.id === payload.id)) return prev;
          if (status === 'LIVE' || status === undefined) {
            return [payload as any, ...prev];
          }
          return prev;
        });
        setScheduledLivestreams((prev) => {
          if (prev.some((p) => p.id === payload.id)) return prev;
          if (status === 'SCHEDULED') {
            return [payload as any, ...prev];
          }
          return prev;
        });
      } catch (err) {
        // ignore
      }
    };

    const onPricingUpdated = (payload: any) => {
      if (!payload?.id) return;
      const id = payload.id as string;
      const { productPricing } = payload;

      setActiveLivestreams((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx === -1) return prev;
        const item = prev[idx];
        const updated = { ...item, productPricing } as any;
        const copy = prev.slice();
        copy[idx] = updated;
        return copy;
      });

      setScheduledLivestreams((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx === -1) return prev;
        const item = prev[idx];
        const updated = { ...item, productPricing } as any;
        const copy = prev.slice();
        copy[idx] = updated;
        return copy;
      });
    };

    const onStatusUpdated = (payload: any) => {
      if (!payload?.id) return;
      const id = payload.id as string;
      const status = (payload.status || '') as string;

      if (status === 'ENDED') {
        // Remove from both lists
        setActiveLivestreams((prev) => prev.filter((p) => p.id !== id));
        setScheduledLivestreams((prev) => prev.filter((p) => p.id !== id));
        return;
      }

      if (status === 'LIVE') {
        // Move to active
        setScheduledLivestreams((prev) => prev.filter((p) => p.id !== id));
        setActiveLivestreams((prev) => {
          const existing = prev.some((p) => p.id === id);
          if (existing) {
            return prev.map((p) => (p.id === id ? { ...p, ...payload } : p));
          }
          return [payload as any, ...prev];
        });
        return;
      }

      if (status === 'SCHEDULED') {
        // Move to scheduled if not exist
        setActiveLivestreams((prev) => prev.filter((p) => p.id !== id));
        setScheduledLivestreams((prev) => {
          const existing = prev.some((p) => p.id === id);
          if (existing) {
            return prev.map((p) => (p.id === id ? { ...p, ...payload } : p));
          }
          return [payload as any, ...prev];
        });
        return;
      }
    };

    socket.on('livestream:new', onNewLivestream);
    socket.on('livestream:pricing-updated', onPricingUpdated);
    socket.on('livestream:status-updated', onStatusUpdated);
    // Snapshot of viewer counts for list pages
    socket.on('livestreams:viewer-counts', (payload: Array<{ id: string; viewerCount: number }>) => {
      // eslint-disable-next-line no-console
      console.debug('[socket] livestreams:viewer-counts snapshot', payload);
      if (!Array.isArray(payload)) return;
      try {
        setActiveLivestreams((prev) => {
          if (!Array.isArray(prev)) return prev;
          const map = new Map(prev.map(p => [p.id, p]));
          payload.forEach(item => {
            if (map.has(item.id)) {
              const orig = map.get(item.id)!;
              map.set(item.id, { ...orig, viewerCount: item.viewerCount } as any);
            }
          });
          return Array.from(map.values());
        });
        setScheduledLivestreams((prev) => {
          if (!Array.isArray(prev)) return prev;
          const map = new Map(prev.map(p => [p.id, p]));
          payload.forEach(item => {
            if (map.has(item.id)) {
              const orig = map.get(item.id)!;
              map.set(item.id, { ...orig, viewerCount: item.viewerCount } as any);
            }
          });
          return Array.from(map.values());
        });
      } catch (err) {
        // ignore snapshot errors
      }
    });

    // Listener for incremental viewer count updates
    socket.on('livestream:viewer-count', (payload: { id?: string; viewerCount?: number }) => {
      // eslint-disable-next-line no-console
      console.debug('[socket] livestream:viewer-count update', payload);
      if (!payload || !payload.id) return;
      const id = payload.id;
      const vc = typeof payload.viewerCount === 'number' ? payload.viewerCount : Number(payload.viewerCount);
      if (Number.isNaN(vc)) return;
      setActiveLivestreams(prev => {
        const idx = prev.findIndex(p => p.id === id);
        if (idx === -1) return prev;
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], viewerCount: vc } as any;
        return copy;
      });
      setScheduledLivestreams(prev => {
        const idx = prev.findIndex(p => p.id === id);
        if (idx === -1) return prev;
        const copy = prev.slice();
        copy[idx] = { ...copy[idx], viewerCount: vc } as any;
        return copy;
      });
    });

    socket.on('connect', () => {
      try {
        socket.emit('livestreams:list-join');
      } catch {}
    });

    return () => {
      try { socket.emit('livestreams:list-leave'); } catch {}
      socket.off('livestream:new', onNewLivestream);
      socket.off('livestream:pricing-updated', onPricingUpdated);
      socket.off('livestream:status-updated', onStatusUpdated);
      socket.off('livestreams:viewer-counts');
      socket.off('livestream:viewer-count');
      socket.disconnect();
    };
  }, []);

  return {
    activeLivestreams,
    scheduledLivestreams,
    isLoading,
    error,
    loadLivestreams,
  } as const;
};
