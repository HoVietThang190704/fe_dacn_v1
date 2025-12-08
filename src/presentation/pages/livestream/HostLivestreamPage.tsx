"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from './components/hostlivestreampage/Icon';
import LivestreamHeader from './components/hostlivestreampage/LivestreamHeader';
import VideoPreview from './components/hostlivestreampage/VideoPreview';
import Controls from './components/hostlivestreampage/Controls';
import LinkedProductsList from './components/hostlivestreampage/LinkedProductsList';
import PricingEditor from './components/hostlivestreampage/PricingEditor';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/shared/hooks/useAuth';
import { container } from '@/presentation/di/container';
import { Livestream, LivestreamProductPricing, LivestreamStatus } from '@/domain/entities/Livestream';
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { io, Socket } from 'socket.io-client';
import { ChatBox, ChatMessage } from '@/components/livestream/ChatBox';
import { API_CONFIG } from '@/shared/constants/api';
import { LIVESTREAM_CONFIG } from '@/shared/constants/livestream';
import { useLivestreamProducts } from '@/shared/hooks/useLivestreamProducts';

interface HostLivestreamPageProps {
  livestreamId: string;
}

export const HostLivestreamPage: React.FC<HostLivestreamPageProps> = ({ livestreamId }) => {
  const t = useTranslations('livestream');
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);

  const [pricingDraft, setPricingDraft] = useState<Record<string, { livePrice: string; maxQuantity: string }>>({});
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [pricingMessage, setPricingMessage] = useState('');

  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const videoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const hasCheckedAuthRef = useRef(false);

  const {
    products: linkedProducts,
    isLoading: isLoadingLinkedProducts,
    error: linkedProductsError,
  } = useLivestreamProducts(livestream?.products ?? [], livestream?.productSummaries);

  const priceFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }),
    []
  );

  const shouldShowLinkedProducts =
    (livestream?.products && livestream.products.length > 0) || isLoadingLinkedProducts || Boolean(linkedProductsError);

  const hostPricingMap = React.useMemo(() => {
    const map: Record<string, { livePrice?: number; remaining?: number | null }> = {};
    livestream?.productPricing?.forEach((item) => {
      const remaining = item.maxQuantity != null ? Math.max((item.maxQuantity ?? 0) - (item.claimedQuantity ?? 0), 0) : null;
      map[item.productId] = {
        livePrice: item.active ? item.livePrice : undefined,
        remaining,
      };
    });
    return map;
  }, [livestream?.productPricing]);

  const renderLinkedProducts = () => (
    <LinkedProductsList products={linkedProducts} isLoading={isLoadingLinkedProducts} error={linkedProductsError} formatter={priceFormatter} livePricing={hostPricingMap} />
  );

  useEffect(() => {
    if (!linkedProducts.length) return;

    setPricingDraft((prev) => {
      const nextDraft = { ...prev } as Record<string, { livePrice: string; maxQuantity: string }>;
      let hasChanges = false;

      const linkedIds = linkedProducts.map((product) => product.id);
      Object.keys(nextDraft).forEach((productId) => {
        if (!linkedIds.includes(productId)) {
          delete nextDraft[productId];
          hasChanges = true;
        }
      });

      linkedProducts.forEach((product) => {
        if (nextDraft[product.id]) return;
        const existing = livestream?.productPricing?.find((pricing) => pricing.productId === product.id);
        nextDraft[product.id] = {
          livePrice: existing ? String(existing.livePrice) : product.price ? String(product.price) : '',
          maxQuantity: existing?.maxQuantity != null ? String(existing.maxQuantity) : ''
        };
        hasChanges = true;
      });

      return hasChanges ? nextDraft : prev;
    });
  }, [linkedProducts, livestream?.productPricing]);

  const handlePricingChange = (productId: string, field: 'livePrice' | 'maxQuantity', value: string) => {
    setPricingDraft((prev) => ({
      ...prev,
      [productId]: {
        livePrice: prev[productId]?.livePrice ?? '',
        maxQuantity: prev[productId]?.maxQuantity ?? '',
        [field]: value
      }
    }));
  };

  const buildPricingPayload = (): LivestreamProductPricing[] => {
    return linkedProducts.map((product) => {
      const draft = pricingDraft[product.id] ?? { livePrice: '', maxQuantity: '' };
      const existing = livestream?.productPricing?.find((pricing) => pricing.productId === product.id);

      const livePriceNumber = Number(draft.livePrice);
      const maxQuantityNumber = draft.maxQuantity !== '' ? Number(draft.maxQuantity) : null;
      const stockQty = typeof product.stockQuantity === 'number' ? product.stockQuantity : null;

      const livePrice = Number.isFinite(livePriceNumber) && livePriceNumber > 0
        ? livePriceNumber
        : existing?.livePrice ?? product.price ?? 0;

      let maxQuantity =
        maxQuantityNumber !== null && Number.isFinite(maxQuantityNumber) && maxQuantityNumber > 0
          ? maxQuantityNumber
          : (stockQty ?? null);

      if (stockQty !== null && maxQuantity !== null) {
        maxQuantity = Math.min(maxQuantity, stockQty);
      }

      return {
        productId: product.id,
        livePrice,
        maxQuantity,
        claimedQuantity: 0,
        active: existing?.active ?? true
      };
    });
  };

  const handleSavePricing = async () => {
    setIsSavingPricing(true);
    setPricingMessage('');
    try {
      const updateLivestreamProductsUseCase = container.updateLivestreamProductsUseCase;
      const updatedLivestream = await updateLivestreamProductsUseCase.execute(livestreamId, buildPricingPayload());
      setLivestream((prev) => (prev ? { ...prev, productPricing: updatedLivestream.productPricing } : updatedLivestream));
      setPricingMessage(t('host.pricingSaved'));
    } catch {
      setPricingMessage(t('host.pricingError'));
    } finally {
      setIsSavingPricing(false);
    }
  };

  

  const loadLivestream = useCallback(async () => {
    try {
      setIsLoading(true);
      const getLivestreamByIdUseCase = container.getLivestreamByIdUseCase;
      const data = await getLivestreamByIdUseCase.execute(livestreamId);
      setLivestream(data);

      if (data.hostId !== user?.id) {
        setError(t('errors.notAuthorized'));
        setTimeout(() => router.push('/main/livestream'), LIVESTREAM_CONFIG.REDIRECT_DELAY_MS);
      }
    } catch {
        setError(t('errors.loadFailed'));
      } finally {
      setIsLoading(false);
    }
  }, [livestreamId, user?.id, t, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated && !hasCheckedAuthRef.current) {
      hasCheckedAuthRef.current = true;
      router.push('/auth/login');
      return;
    }
    if (isAuthenticated && !hasCheckedAuthRef.current) {
      hasCheckedAuthRef.current = true;
      loadLivestream();
    }
  }, [authLoading, isAuthenticated, loadLivestream, router]);

  const initializeAgora = async () => {
    if (!livestream) return;
    if (isInitializing) return;

    setIsInitializing(true);
    setError('');
    

    try {
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(t('errors.browserNotSupported'));
        setIsInitializing(false);
        return;
      }

      
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      
      
      const getAgoraTokenUseCase = container.getAgoraTokenUseCase;
      const tokenData = await getAgoraTokenUseCase.execute(
        livestream.channelName,
        0,
        'publisher'
      );
      

      
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      
      await client.setClientRole('host');

      
      await client.join(tokenData.appId, livestream.channelName, tokenData.token, tokenData.uid);

      
      client.on('user-joined', () => {
        setViewerCount(client.remoteUsers.length);
      });

      client.on('user-left', () => {
        setViewerCount(client.remoteUsers.length);
      });

      
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      videoTrackRef.current = videoTrack;
      audioTrackRef.current = audioTrack;

      
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      
      await client.publish([videoTrack, audioTrack]);

      
      const updateLivestreamStatusUseCase = container.updateLivestreamStatusUseCase;
      await updateLivestreamStatusUseCase.execute(livestreamId, LivestreamStatus.LIVE);

      
      setIsStreaming(true);
      setIsInitializing(false);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Permission') || error.message.includes('NotAllowedError')) {
          setError(t('errors.permissionRequired'));
        } else {
          setError(t('errors.streamInitFailed') + ': ' + error.message);
        }
      } else {
        setError(t('errors.streamInitFailed') + ': Unknown error');
      }

      if (videoTrackRef.current) {
        videoTrackRef.current.close();
        videoTrackRef.current = null;
      }
      if (audioTrackRef.current) {
        audioTrackRef.current.close();
        audioTrackRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.leave().catch(() => {});
        clientRef.current = null;
      }

      setIsInitializing(false);
    }
  };

  const toggleCamera = async () => {
    if (videoTrackRef.current && clientRef.current) {
      const newState = !isCameraOn;
      
      try {
        
        
        await videoTrackRef.current.setEnabled(newState);
        
        
        if (newState) {
          await clientRef.current.publish([videoTrackRef.current]);
        } else {
          await clientRef.current.unpublish([videoTrackRef.current]);
        }
        
        setIsCameraOn(newState);
      } catch {
        setError(t('errors.streamInitFailed'));
      }
    }
  };

  const toggleMic = async () => {
    if (audioTrackRef.current && clientRef.current) {
      const newState = !isMicOn;
      
      try {
        
        
        await audioTrackRef.current.setEnabled(newState);
        
        
        if (newState) {
          await clientRef.current.publish([audioTrackRef.current]);
        } else {
          await clientRef.current.unpublish([audioTrackRef.current]);
        }
        
        setIsMicOn(newState);
      } catch {
        setError(t('errors.streamInitFailed'));
      }
    }
  };

  
  useEffect(() => {
    if (!user || !livestreamId) return;

    const socketUrl = API_CONFIG.SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const socket = io(socketUrl || undefined, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-livestream', {
        livestreamId,
        userId: user.id,
        userName: user.userName || user.email
      });
    });

    socket.on('chat-history', (messages: ChatMessage[]) => {
      setChatMessages(messages);
    });

    socket.on('new-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    socket.on('viewer-count', ({ viewerCount: count }: { viewerCount: number }) => {
      setViewerCount(count);
    });

    socket.on('livestream:pricing-updated', (payload: { productPricing: Livestream['productPricing'] }) => {
      setLivestream((prev) => (prev ? { ...prev, productPricing: payload.productPricing } : prev));
    });
    socket.on('livestream:product-stock-updated', (payload: { products: Array<{ productId: string; stockQuantity: number | null }> }) => {
      setLivestream((prev) => {
        if (!prev) return prev;
        if (!Array.isArray(prev.productSummaries)) return prev;
        const map = new Map(payload.products.map(p => [p.productId, p.stockQuantity]));
        const updatedSummaries = prev.productSummaries.map(s => {
          const val = map.get(s.id);
          if (val == null) return s;
          return { ...s, stockQuantity: val };
        });
        return { ...prev, productSummaries: updatedSummaries } as Livestream;
      });
    });

    socket.on('user-joined', () => {});

    return () => {
      socket.emit('leave-livestream', { livestreamId });
      socket.disconnect();
    };
  }, [user, livestreamId]);

  const handleSendMessage = (message: string) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit('send-message', {
      livestreamId,
      userId: user.id,
      userName: user.userName || user.email,
      message
    });
  };

  const endStream = async () => {
    if (window.confirm(t('host.confirmEnd'))) {
      try {
        if (clientRef.current && (videoTrackRef.current || audioTrackRef.current)) {
          const tracksToUnpublish = [];
          if (videoTrackRef.current) tracksToUnpublish.push(videoTrackRef.current);
          if (audioTrackRef.current) tracksToUnpublish.push(audioTrackRef.current);
          if (tracksToUnpublish.length > 0) await clientRef.current.unpublish(tracksToUnpublish);
        }

        if (videoTrackRef.current) {
          videoTrackRef.current.stop();
          videoTrackRef.current.close();
          videoTrackRef.current = null;
        }

        if (audioTrackRef.current) {
          audioTrackRef.current.stop();
          audioTrackRef.current.close();
          audioTrackRef.current = null;
        }

        if (clientRef.current) {
          await clientRef.current.leave();
          clientRef.current = null;
        }

        const updateLivestreamStatusUseCase = container.updateLivestreamStatusUseCase;
        await updateLivestreamStatusUseCase.execute(livestreamId, LivestreamStatus.ENDED);

        router.push('/main/livestream');
      } catch {
        setError(t('errors.endStreamFailed'));
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        if (clientRef.current) {
          try {
            const tracksToUnpublish: (ICameraVideoTrack | IMicrophoneAudioTrack)[] = [];
            if (videoTrackRef.current) tracksToUnpublish.push(videoTrackRef.current);
            if (audioTrackRef.current) tracksToUnpublish.push(audioTrackRef.current);
            if (tracksToUnpublish.length > 0) clientRef.current.unpublish(tracksToUnpublish).catch(() => {});
          } catch {
          }
          try { clientRef.current.leave().catch(() => {}); } catch {
          }
        }
      } catch {
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (clientRef.current && (videoTrackRef.current || audioTrackRef.current)) {
        const tracksToUnpublish: (ICameraVideoTrack | IMicrophoneAudioTrack)[] = [];
        if (videoTrackRef.current) tracksToUnpublish.push(videoTrackRef.current);
        if (audioTrackRef.current) tracksToUnpublish.push(audioTrackRef.current);
        if (tracksToUnpublish.length > 0) clientRef.current.unpublish(tracksToUnpublish).catch(() => {});
      }

      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current.close();
        videoTrackRef.current = null;
      }
      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current.close();
        audioTrackRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.leave().catch(() => {});
        clientRef.current = null;
      }
    };
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !livestream) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-4">{<Icon name={('WARNING' as const)} alt={t('errors.livestreamNotFound') as string} width={64} height={64} />}</div>
          <p className="text-xl text-white">{error || t('errors.livestreamNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <LivestreamHeader title={livestream.title} hostAvatar={livestream.hostAvatar} hostName={livestream.hostName} isStreaming={isStreaming} viewerCount={viewerCount} />

      
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="xl:col-span-3 space-y-4">
            <VideoPreview localVideoRef={localVideoRef} isStreaming={isStreaming} isInitializing={isInitializing} error={error} onStart={initializeAgora} />

            {isStreaming && (
              <Controls isCameraOn={isCameraOn} isMicOn={isMicOn} onToggleCamera={toggleCamera} onToggleMic={toggleMic} onEndStream={endStream} />
            )}

            
            
            <div className="xl:hidden bg-gray-800/50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">{t('host.streamInfo')}</h3>
              <p className="text-sm text-gray-300">{livestream.description || t('noDescription')}</p>
            </div>

            {shouldShowLinkedProducts && (
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{t('host.linkedProducts')}</h3>
                    <p className="text-xs text-gray-400">{t('host.linkedProductsHelper')}</p>
                  </div>
                  <span className="text-sm text-gray-300 font-medium">{linkedProducts.length}</span>
                </div>
                {renderLinkedProducts()}
              </div>
            )}

            <PricingEditor
              livestream={livestream}
              linkedProducts={linkedProducts}
              pricingDraft={pricingDraft}
              handlePricingChange={handlePricingChange}
              handleSavePricing={handleSavePricing}
              isSavingPricing={isSavingPricing}
              pricingMessage={pricingMessage}
              priceFormatter={(n) => priceFormatter.format(n)}
              t={t}
            />
          </div>
          <div className="xl:col-span-1 space-y-4">
            <div className="h-[400px] sm:h-[500px]">
              <ChatBox 
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                currentUserName={user?.userName || user?.email || ''}
                viewerCount={viewerCount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
