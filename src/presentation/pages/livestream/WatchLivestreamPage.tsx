'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { container } from '@/presentation/di/container';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';
import type { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { io, Socket } from 'socket.io-client';
import { ChatBox, ChatMessage } from '@/components/livestream/ChatBox';
import { useAuth } from '@/shared/hooks/useAuth';
import { API_CONFIG } from '@/shared/constants/api';
import { cleanupAgoraConnection } from '@/shared/utils/livestream';
import { ICONS } from '@/shared/constants/images';
import { useLivestreamProducts } from '@/shared/hooks/useLivestreamProducts';
import { Link } from '@/i18n/routing';

interface WatchLivestreamPageProps {
  livestreamId: string;
}

export const WatchLivestreamPage: React.FC<WatchLivestreamPageProps> = ({ livestreamId }) => {
  const t = useTranslations('livestream');
  const locale = useLocale();
  const { user } = useAuth();

  const [livestream, setLivestream] = useState<Livestream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  // Socket.IO states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const currencyFormatter = React.useMemo(() => {
    const intlLocale = locale === 'en' ? 'en-US' : 'vi-VN';
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    });
  }, [locale]);

  const {
    products: linkedProducts,
    isLoading: isLoadingLinkedProducts,
    error: linkedProductsError,
  } = useLivestreamProducts(livestream?.products ?? [], livestream?.productSummaries);

  const shouldShowProductPanel =
    (livestream?.products && livestream.products.length > 0) || isLoadingLinkedProducts || Boolean(linkedProductsError);

  const renderProductList = (variant: 'grid' | 'list') => {
    if (isLoadingLinkedProducts) {
      return (
        <div className="text-sm text-gray-400 py-2">
          {t('watch.loadingProducts')}
        </div>
      );
    }

    if (linkedProductsError) {
      return (
        <div className="text-sm text-red-400 py-2">
          {t('watch.productsError')}
        </div>
      );
    }

    if (!linkedProducts.length) {
      return (
        <div className="text-sm text-gray-400 py-2">
          {t('watch.noProducts')}
        </div>
      );
    }

    if (variant === 'grid') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {linkedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/main/products/${product.id}`}
              className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition flex flex-col gap-2"
            >
              <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-600 relative">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    <Image src={ICONS.GOODS} alt="product" width={48} height={48} unoptimized />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-300">{currencyFormatter.format(product.price ?? 0)}</p>
              </div>
              <span className="text-xs text-purple-300 font-medium mt-auto">{t('watch.viewProduct')}</span>
            </Link>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {linkedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/main/products/${product.id}`}
            className="flex items-center gap-3 bg-gray-700 rounded-lg p-2 hover:bg-gray-600 transition"
          >
            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-600 relative flex-shrink-0">
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">
                  <Image src={ICONS.GOODS} alt="product" fill unoptimized className="object-contain" />
                </div>
              )}
              
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{product.name}</p>
              <p className="text-xs text-gray-300 truncate">{currencyFormatter.format(product.price ?? 0)}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    );
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
          user.audioTrack?.play();
        }
      });

      client.on('user-unpublished', (user: IAgoraRTCRemoteUser) => {
        if (user.videoTrack) {
          user.videoTrack.stop();
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
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-white mb-6">{error || t('errors.livestreamNotFound')}</p>
          <button
            onClick={leaveLivestream}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            {t('backToList')}
          </button>
        </div>
      </div>
    );
  }

  const hostAvatar = livestream.hostAvatar || '/icons/avatar.jpg';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={leaveLivestream}
            className="flex items-center text-gray-300 hover:text-white transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{t('back')}</span>
          </button>

          {livestream.status === LivestreamStatus.LIVE && (
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              LIVE
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:gap-6">
          <div className="flex-1 lg:max-w-4xl">
            <div className="bg-gray-800 border-b border-gray-700 lg:rounded-t-xl lg:mt-4 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={hostAvatar}
                    alt={livestream.hostName}
                    width={48}
                    height={48}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-purple-500"
                  />
                  <div>
                    <p className="font-semibold text-base sm:text-lg">{livestream.hostName}</p>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                      </svg>
                      <span className="font-semibold">{viewerCount}</span>
                      <span>{t('viewers')}</span>
                    </div>
                  </div>
                </div>
                
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition">
                  {t('watch.follow')}
                </button>
              </div>

              <h1 className="text-lg sm:text-xl font-bold mb-2">{livestream.title}</h1>
              
              {livestream.description && (
                <p className="text-sm text-gray-300 line-clamp-2">
                  {livestream.description}
                </p>
              )}
            </div>

            <div className="bg-black lg:rounded-b-xl overflow-hidden aspect-video relative">
              {livestream.status === LivestreamStatus.LIVE && isJoined ? (
                <div ref={remoteVideoRef} className="w-full h-full"></div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center px-4">
                    {livestream.status === LivestreamStatus.SCHEDULED ? (
                      <>
                        <div className="text-4xl sm:text-6xl mb-4">📅</div>
                        <p className="text-lg sm:text-xl mb-2">{t('watch.scheduled')}</p>
                        {livestream.startTime && (
                          <p className="text-sm sm:text-base text-gray-400">
                            {t('watch.startTime')}: {new Date(livestream.startTime).toLocaleString(locale)}
                          </p>
                        )}
                      </>
                    ) : livestream.status === LivestreamStatus.ENDED ? (
                      <>
                        <div className="text-4xl sm:text-6xl mb-4">📺</div>
                        <p className="text-lg sm:text-xl mb-2">{t('watch.ended')}</p>
                        <p className="text-sm sm:text-base text-gray-400">{t('watch.thankYou')}</p>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl sm:text-6xl mb-4">⏳</div>
                        <p className="text-lg sm:text-xl">{t('watch.connecting')}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {shouldShowProductPanel && (
              <div className="lg:hidden bg-gray-800 border-t border-gray-700 px-4 py-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Image src={ICONS.GOODS} alt="products" width={22} height={22} className="w-5 h-5" unoptimized />
                  <span>{t('watch.products')}</span>
                </h3>
                {renderProductList('grid')}
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
                    <Image src={ICONS.GOODS} alt="products" width={20} height={20} className="w-5 h-5" unoptimized />
                    <span>{t('watch.products')}</span>
                  </h3>
                  {renderProductList('list')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
