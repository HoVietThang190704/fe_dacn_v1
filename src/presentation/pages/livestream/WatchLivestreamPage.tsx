'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { container } from '@/presentation/di/container';
import { Livestream, LivestreamProductSummary, LivestreamStatus } from '@/domain/entities/Livestream';
import type { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { io, Socket } from 'socket.io-client';
import { ChatBox, ChatMessage } from '@/components/livestream/ChatBox';
import { useAuth } from '@/shared/hooks/useAuth';
import { API_CONFIG } from '@/shared/constants/api';
import { cleanupAgoraConnection } from '@/shared/utils/livestream';
import { ICONS } from '@/shared/constants/images';
import LivestreamHeader from './components/watchlivestreampage/LivestreamHeader';
import LivestreamProductList from './components/watchlivestreampage/LivestreamProductList';
import LivestreamPlaceholder from './components/watchlivestreampage/LivestreamPlaceholder';
import ProductModal from './components/watchlivestreampage/ProductModal';
import { useLivestreamProducts } from '@/shared/hooks/useLivestreamProducts';
import { useRouter } from '@/i18n/routing';
 

interface WatchLivestreamPageProps {
  livestreamId: string;
}

export const WatchLivestreamPage: React.FC<WatchLivestreamPageProps> = ({ livestreamId }) => {
  const t = useTranslations('livestream');
  const locale = useLocale();
  const { user } = useAuth();
  const router = useRouter();

  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);
  const userAudioElementsRef = useRef<Map<string | number, HTMLAudioElement>>(new Map());
  const [needsAudioPermission, setNeedsAudioPermission] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<LivestreamProductSummary | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const currencyFormatter = React.useMemo(() => {
    const intlLocale = locale === 'en' ? 'en-US' : 'vi-VN';
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    });
  }, [locale]);

  if (!ICONS.WARNING) throw new Error('Missing icon: ICONS.WARNING');
  if (!ICONS.ARROW_LEFT) throw new Error('Missing icon: ICONS.ARROW_LEFT');
  if (!ICONS.PLACEHOLDER) throw new Error('Missing icon: ICONS.PLACEHOLDER');
  if (!ICONS.GOODS) throw new Error('Missing icon: ICONS.GOODS');

  const {
    products: linkedProducts,
    isLoading: isLoadingLinkedProducts,
    error: linkedProductsError,
  } = useLivestreamProducts(livestream?.products ?? [], livestream?.productSummaries);

  const shouldShowProductPanel =
    (livestream?.products && livestream.products.length > 0) || isLoadingLinkedProducts || Boolean(linkedProductsError);

  const pricingMap = useMemo(() => {
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

  const getPurchaseInfo = useCallback((product: LivestreamProductSummary) => {
    const pricing = pricingMap[product.id];
    const remainingRaw = pricing?.remaining ?? null;
    const livePrice = pricing?.livePrice;
    const stockQty = typeof product.stockQuantity === 'number' ? product.stockQuantity : Infinity;
    const remaining = remainingRaw != null ? Math.min(remainingRaw, stockQty) : null;
    const limitByPromo = remaining != null && remaining > 0 ? remaining : Infinity;
    const maxAllowed = Math.max(0, Math.min(limitByPromo, stockQty));
    const activeLivePrice = livePrice != null && (remaining == null || remaining > 0) ? livePrice : undefined;
    const disableBuy = stockQty <= 0;

    return {
      maxAllowed,
      activeLivePrice,
      remaining,
      stock: stockQty,
      disableBuy,
    };
  }, [pricingMap]);

  const openProductModal = (product: (typeof linkedProducts)[number]) => {
    const info = getPurchaseInfo(product);
    const initialQty = info.maxAllowed > 0 ? 1 : 0;
    setSelectedProduct(product);
    setSelectedQuantity(initialQty);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setSelectedQuantity(1);
  };

  const updateQuantity = (delta: number) => {
    if (!selectedProduct) return;
    const { maxAllowed } = getPurchaseInfo(selectedProduct);
    const capped = maxAllowed > 0 ? maxAllowed : 0;
    const base = Math.max(selectedQuantity + delta, 1);
    const next = capped > 0 ? Math.min(base, capped) : 0;
    setSelectedQuantity(next);
  };

  const handleBuyNow = () => {
    if (!selectedProduct) return;
    const { activeLivePrice } = getPurchaseInfo(selectedProduct);
    const price = activeLivePrice ?? selectedProduct.price ?? 0;
    const params = new URLSearchParams({
      buyNow: 'true',
      productId: selectedProduct.id,
      quantity: String(selectedQuantity),
      price: String(price),
      title: selectedProduct.name,
      thumbnail: selectedProduct.thumbnail || '',
      unit: selectedProduct.unit || '',
      livestreamId: livestream?.id || '',
    });
    router.push(`/main/checkout?${params.toString()}`);
  };
  

  const joinLivestream = useCallback(async (data: Livestream) => {
    try {
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      
      const getAgoraTokenUseCase = container.getAgoraTokenUseCase;
      const tokenData = await getAgoraTokenUseCase.execute(
        data.channelName,
        0,
        'audience'
      );

      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      await client.setClientRole('audience');

      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video' && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }

        if (mediaType === 'audio') {
          try {
            const uid = (user.uid as string | number);
            if (userAudioElementsRef.current.has(uid)) {
              const existing = userAudioElementsRef.current.get(uid)!;
              existing.remove();
              userAudioElementsRef.current.delete(uid);
            }
            const beforeEls = Array.from(document.querySelectorAll<HTMLAudioElement>('audio'));
            try { user.audioTrack?.play(); } catch  { }

            setTimeout(() => {
              try {
                const afterEls = Array.from(document.querySelectorAll<HTMLAudioElement>('audio'));
                const added = afterEls.filter(a => !beforeEls.includes(a));
                if (added.length > 0) {
                  const el = added[0];
                  el.muted = false;
                  el.volume = 1;
                  el.style.display = 'none';
                  userAudioElementsRef.current.set(uid, el);
                } else {
                  setNeedsAudioPermission(true);
                }
              } catch {
                }
            }, 80);
          } catch {
          }
        }
      });

      client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        if (mediaType === 'video') {
          try { user.videoTrack?.stop(); } catch {}
        } else if (mediaType === 'audio') {
          try { user.audioTrack?.stop?.(); } catch {}
          try {
            const uid = (user.uid as string | number);
            const element = userAudioElementsRef.current.get(uid);
            if (element) {
              try { element.pause(); } catch {}
              try { element.remove(); } catch {}
              userAudioElementsRef.current.delete(uid);
            }
          } catch {
          }
        }
      });

      client.on('user-left', (user: IAgoraRTCRemoteUser) => {
        try { user.videoTrack?.stop(); } catch {}
        try { user.audioTrack?.stop?.(); } catch {}
        try {
          const uid = (user.uid as string | number);
          const element = userAudioElementsRef.current.get(uid);
          if (element) {
            try { element.pause(); } catch {}
            try { element.remove(); } catch {}
            userAudioElementsRef.current.delete(uid);
          }
        } catch {
        }
      });

      await client.join(tokenData.appId, data.channelName, tokenData.token, tokenData.uid);
      setIsJoined(true);
    } catch {
      setError(t('errors.joinFailed'));
    }
  }, [t]);

  const loadLivestream = useCallback(async () => {
    try {
      setIsLoading(true);
      const getLivestreamByIdUseCase = container.getLivestreamByIdUseCase;
      const data = await getLivestreamByIdUseCase.execute(livestreamId);
      setLivestream(data);

      if (data.status === LivestreamStatus.LIVE) {
        await joinLivestream(data);
      }
    } catch {
      setError(t('errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [livestreamId, joinLivestream, t]);

  useEffect(() => {
    loadLivestream();

    const handleBeforeUnload = () => {
      try {
        document.querySelectorAll('audio').forEach(audio => {
          try { audio.pause(); audio.muted = true; audio.srcObject = null; audio.remove(); } catch {}
        });

        if (clientRef.current) {
          const remoteUsers = clientRef.current.remoteUsers;
          remoteUsers.forEach(user => {
            try { if (user.audioTrack) user.audioTrack.stop(); } catch {}
            try { if (user.videoTrack) user.videoTrack.stop(); } catch {}
          });
          try { clientRef.current.leave().catch(() => {}); } catch {}
        }
      } catch {
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (clientRef.current) {
        const remoteUsers = clientRef.current.remoteUsers;
        remoteUsers.forEach(user => {
          if (user.audioTrack) {
            user.audioTrack.stop();
          }
          if (user.videoTrack) {
            user.videoTrack.stop();
          }
        });

        clientRef.current.leave().catch(() => {});
        clientRef.current = null;
      }
    };
  }, [loadLivestream]);

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

    socket.on('disconnect', () => {
    });

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

  const leaveLivestream = async () => {
    setIsJoined(false);
    
    await cleanupAgoraConnection(clientRef, remoteVideoRef);
    
    window.location.href = '/main/livestream';
  };

  const enableAudio = () => {
    try {
      const audios = Array.from(document.querySelectorAll<HTMLAudioElement>('audio'));
      audios.forEach(a => {
        try {
          a.muted = false;
          a.volume = 1;
          a.play().catch(() => {});
        } catch {}
      });
      setNeedsAudioPermission(false);
    } catch {}
  };

  if (isLoading) {
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
          <div className="text-6xl mb-4">
            <Image src={ICONS.WARNING} alt={t('errors.livestreamNotFound')} width={80} height={80} unoptimized />
          </div>
          <p className="text-xl text-white mb-6">{error || t('errors.livestreamNotFound')}</p>
          <button onClick={leaveLivestream} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition">
            {t('backToList')}
          </button>
        </div>
      </div>
    );
  }

  const hostAvatar = livestream.hostAvatar || ICONS.PLACEHOLDER;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <button onClick={leaveLivestream} className="flex items-center text-gray-300 hover:text-white transition">
              <Image src={ICONS.ARROW_LEFT} alt={t('back')} width={20} height={20} className="w-5 h-5 mr-2" unoptimized />
              <span className="hidden sm:inline">{t('back')}</span>
            </button>
          </div>
          {livestream.status === LivestreamStatus.LIVE && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full" />
              {t('liveBadge')}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:gap-6">
          <div className="flex-1 lg:max-w-4xl lg:ml-3">
            <div className="bg-gray-800 border-b border-gray-700 lg:rounded-t-xl lg:mt-4 px-4 sm:px-6 py-4">
              <LivestreamHeader livestream={livestream} viewerCount={viewerCount} hostAvatar={hostAvatar} onLeave={leaveLivestream} />
            </div>

            <div className="bg-black lg:rounded-b-xl overflow-hidden aspect-video relative -mt-3">
              {livestream.status === LivestreamStatus.LIVE && isJoined ? (
                <div ref={remoteVideoRef} className="w-full h-full"></div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center px-4">
                    <LivestreamPlaceholder status={livestream.status} startTime={livestream.startTime} />
                  </div>
                </div>
              )}

              {needsAudioPermission && (
                <div className="absolute left-4 bottom-4 z-20">
                  <button onClick={enableAudio} className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm">{t('watch.enableAudio') || 'Enable audio'}</button>
                </div>
              )}
            </div>

            {shouldShowProductPanel && (
              <div className="lg:hidden bg-gray-800 border-t border-gray-700 px-4 py-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Image src={ICONS.GOODS} alt={t('productsAlt')} width={22} height={22} className="w-5 h-5" unoptimized />
                  <span>{t('watch.products')}</span>
                </h3>
                <LivestreamProductList
                  products={linkedProducts}
                  isLoading={isLoadingLinkedProducts}
                  error={linkedProductsError}
                  variant="grid"
                  formatPrice={(n) => currencyFormatter.format(n ?? 0)}
                  livePricing={pricingMap}
                  onSelect={openProductModal}
                />
              </div>
            )}
          </div>

          <div className="lg:w-96 lg:sticky lg:top-16 lg:h-full lg:mt-4">
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-[400px] lg:min-h-0">
                <ChatBox 
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  currentUserName={user?.userName || user?.email || ''}
                  viewerCount={viewerCount}
                />
              </div>

              {shouldShowProductPanel && (
                <div className="hidden lg:block bg-gray-800 rounded-xl p-4 mt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Image src={ICONS.GOODS} alt={t('productsAlt')} width={20} height={20} className="w-5 h-5" unoptimized />
                    <span>{t('watch.products')}</span>
                  </h3>
                  <LivestreamProductList
                    products={linkedProducts}
                    isLoading={isLoadingLinkedProducts}
                    error={linkedProductsError}
                    variant="list"
                    formatPrice={(n) => currencyFormatter.format(n ?? 0)}
                    livePricing={pricingMap}
                    onSelect={openProductModal}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          selectedQuantity={selectedQuantity}
          purchaseInfo={getPurchaseInfo(selectedProduct)}
          currencyFormatter={(n) => currencyFormatter.format(n ?? 0)}
          onClose={closeProductModal}
          updateQuantity={(delta) => updateQuantity(delta)}
          onBuyNow={handleBuyNow}
          t={t}
        />
      )}
    </div>
  );
};
