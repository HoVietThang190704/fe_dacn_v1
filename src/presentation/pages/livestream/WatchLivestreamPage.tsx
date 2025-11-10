'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { container } from '@/presentation/di/container';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';
import type { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { io, Socket } from 'socket.io-client';
import { ChatBox, ChatMessage } from '@/components/livestream/ChatBox';
import { useAuth } from '@/shared/hooks/useAuth';
import { API_CONFIG } from '@/shared/constants/api';

interface WatchLivestreamPageProps {
  livestreamId: string;
}

export const WatchLivestreamPage: React.FC<WatchLivestreamPageProps> = ({ livestreamId }) => {
  const t = useTranslations('livestream');
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

  

  const joinLivestream = useCallback(async (data: Livestream) => {
    try {
      console.log('[WatchLivestream] Joining livestream:', data.channelName);
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
      console.log('[WatchLivestream] ✅ Joined successfully');
    } catch (err) {
      console.error('[WatchLivestream] ❌ Join error:', err);
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
    } catch (err) {
      console.error('Load livestream error:', err);
      setError(t('errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [livestreamId, joinLivestream, t]);

  // Run load once and attach a beforeunload handler to make a best-effort leave
  useEffect(() => {
    loadLivestream();

    const handleBeforeUnload = () => {
      try {
        // Mute and remove audio elements
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
      } catch (err) {
        console.error('[WatchLivestream] beforeunload handler error', err);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      console.log('[WatchLivestream] Component unmounting, cleaning up Agora connection...');
      
      // Mute and remove all audio elements FIRST
      document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.muted = true;
        audio.srcObject = null;
        audio.remove();
      });
      
      if (clientRef.current) {
        // Stop all remote tracks before leaving
        const remoteUsers = clientRef.current.remoteUsers;
        remoteUsers.forEach(user => {
          if (user.audioTrack) {
            user.audioTrack.stop();
          }
          if (user.videoTrack) {
            user.videoTrack.stop();
          }
        });

        clientRef.current.leave().catch(console.error);
        clientRef.current = null;
      }
      
      console.log('[WatchLivestream] ✅ Cleanup complete');
    };
  }, [loadLivestream]);

  // Socket.IO setup
  useEffect(() => {
    if (!user || !livestreamId) return;

    console.log('[WatchLivestream] 🔌 Connecting to socket server...');
    const socketUrl = API_CONFIG.SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const socket = io(socketUrl || undefined, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WatchLivestream] ✅ Socket connected:', socket.id);
      // Join livestream room as viewer
      socket.emit('join-livestream', {
        livestreamId,
        userId: user.id,
        userName: user.userName || user.email
      });
    });

    // Listen for chat history (loaded from database)
    socket.on('chat-history', (messages: ChatMessage[]) => {
      console.log('[WatchLivestream] 📜 Chat history loaded:', messages.length);
      setChatMessages(messages);
    });

    // Listen for new messages
    socket.on('new-message', (message: ChatMessage) => {
      console.log('[WatchLivestream] 💬 New message:', message);
      setChatMessages(prev => [...prev, message]);
    });

    // Listen for viewer count updates
    socket.on('viewer-count', ({ viewerCount: count }: { viewerCount: number }) => {
      console.log('[WatchLivestream] 👥 Viewer count:', count);
      setViewerCount(count);
    });

    socket.on('disconnect', () => {
      console.log('[WatchLivestream] 🔌 Socket disconnected');
    });

    return () => {
      console.log('[WatchLivestream] 🔌 Cleaning up socket...');
      socket.emit('leave-livestream', { livestreamId });
      socket.disconnect();
    };
  }, [user, livestreamId]);

  const handleSendMessage = (message: string) => {
    if (!socketRef.current || !user) return;
    
    console.log('[WatchLivestream] 📤 Sending message:', message);
    socketRef.current.emit('send-message', {
      livestreamId,
      userId: user.id,
      userName: user.userName || user.email,
      message
    });
  };

  const leaveLivestream = async () => {
    console.log('[WatchLivestream] 🛑 FORCE LEAVING - Aggressive cleanup mode...');
    
    // Set isJoined = false IMMEDIATELY to trigger UI update
    setIsJoined(false);
    
    try {
      // STEP 1: Immediately mute and pause ALL audio/video in the page
      console.log('[WatchLivestream] 🔇 STEP 1: Muting all media...');
      document.querySelectorAll<HTMLMediaElement>('audio, video').forEach((media) => {
        media.pause();
        media.muted = true;
        media.volume = 0;
        if (media.srcObject) {
          const tracks = (media.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
          media.srcObject = null;
        }
        media.src = '';
        media.load();
      });

      // STEP 2: Agora cleanup
      if (clientRef.current) {
        console.log('[WatchLivestream] 🔇 STEP 2: Agora tracks cleanup...');
        const remoteUsers = clientRef.current.remoteUsers;
        
        // Stop all tracks immediately
        for (const user of remoteUsers) {
          if (user.audioTrack) {
            console.log('[WatchLivestream] Stopping audio for user', user.uid);
            try {
              user.audioTrack.stop();
            } catch (e) {
              console.error('Audio stop error:', e);
            }
          }
          if (user.videoTrack) {
            try {
              user.videoTrack.stop();
            } catch (e) {
              console.error('Video stop error:', e);
            }
          }
        }

        // Unsubscribe all
        console.log('[WatchLivestream] � STEP 3: Unsubscribing...');
        for (const user of remoteUsers) {
          try {
            if (user.hasAudio) {
              await clientRef.current.unsubscribe(user, 'audio');
            }
            if (user.hasVideo) {
              await clientRef.current.unsubscribe(user, 'video');
            }
          } catch (e) {
            console.error('Unsubscribe error:', e);
          }
        }

        // Clear video container
        if (remoteVideoRef.current) {
          remoteVideoRef.current.innerHTML = '';
        }

        // Leave channel
        console.log('[WatchLivestream] 🔇 STEP 4: Leaving channel...');
        await clientRef.current.leave();
        clientRef.current = null;
      }

      // STEP 5: Nuclear option - remove ALL media elements from DOM
      console.log('[WatchLivestream] 🔇 STEP 5: Removing all media elements from DOM...');
      document.querySelectorAll('audio, video').forEach(element => {
        element.remove();
      });

      // STEP 6: Stop all MediaStreamTracks in the entire page
      console.log('[WatchLivestream] 🔇 STEP 6: Stopping all MediaStreamTracks...');
      const mediaElements = document.querySelectorAll<HTMLMediaElement>('audio, video');
      mediaElements.forEach((element) => {
        if (element.srcObject) {
          const tracks = (element.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => {
            track.stop();
            track.enabled = false;
          });
        }
      });
      
      console.log('[WatchLivestream] ✅✅✅ AGGRESSIVE CLEANUP COMPLETE - MUST BE SILENT NOW ✅✅✅');
      
    } catch (err) {
      console.error('[WatchLivestream] ❌ Cleanup error:', err);
      
      // FORCE CLEANUP on error
      if (clientRef.current) {
        try {
          await clientRef.current.leave();
        } catch (e) {
          console.error('Force leave error:', e);
        }
        clientRef.current = null;
      }
      
      // Nuclear option
      document.querySelectorAll<HTMLMediaElement>('audio, video').forEach((element) => {
        element.pause();
        element.muted = true;
        element.volume = 0;
        if (element.srcObject) {
          const tracks = (element.srcObject as MediaStream).getTracks();
          tracks.forEach((track) => track.stop());
        }
        element.remove();
      });
    }
    
    // Wait a bit to ensure everything is cleaned up
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // LAST RESORT: Force reload to /main/livestream to ensure complete cleanup
    console.log('[WatchLivestream] Force navigating with full cleanup...');
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
      {/* Header with Back Button */}
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

      {/* Main Content - Facebook Style Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:gap-6">
          {/* Left Side: Host Info + Video + Description */}
          <div className="flex-1 lg:max-w-4xl">
            {/* Host Info Section - TOP (Facebook style) */}
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
                  {t('watch.follow') || 'Theo dõi'}
                </button>
              </div>

              <h1 className="text-lg sm:text-xl font-bold mb-2">{livestream.title}</h1>
              
              {livestream.description && (
                <p className="text-sm text-gray-300 line-clamp-2">
                  {livestream.description}
                </p>
              )}
            </div>

            {/* Video Player - BELOW HOST INFO */}
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
                            {t('watch.startTime')}: {new Date(livestream.startTime).toLocaleString('vi-VN')}
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

            {/* Products Section - Mobile Only (below video) */}
            {livestream.products && livestream.products.length > 0 && (
              <div className="lg:hidden bg-gray-800 border-t border-gray-700 px-4 py-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <span>🛍️</span>
                  <span>{t('watch.products')}</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {livestream.products.slice(0, 4).map((productId, index) => (
                    <div key={productId} className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition cursor-pointer">
                      <div className="w-full aspect-square bg-gray-600 rounded-lg flex items-center justify-center text-3xl mb-2">
                        🛍️
                      </div>
                      <p className="font-semibold text-sm truncate">
                        {t('watch.product')} #{index + 1}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{productId.slice(0, 8)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Chat + Products (Desktop) */}
          <div className="lg:w-96 lg:sticky lg:top-16 lg:h-full lg:mt-4">
            <div className="flex flex-col h-full">
              {/* Chat Box */}
              <div className="flex-1 min-h-[400px] lg:min-h-0">
                <ChatBox 
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  currentUserName={user?.userName || user?.email || ''}
                  viewerCount={viewerCount}
                />
              </div>

              {/* Products - Desktop Only */}
              {livestream.products && livestream.products.length > 0 && (
                <div className="hidden lg:block bg-gray-800 rounded-xl p-4 mt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>🛍️</span>
                    <span>{t('watch.products')}</span>
                  </h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {livestream.products.map((productId, index) => (
                      <div key={productId} className="flex items-center gap-3 bg-gray-700 rounded-lg p-2 hover:bg-gray-600 transition cursor-pointer">
                        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          🛍️
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate">
                            {t('watch.product')} #{index + 1}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{productId.slice(0, 12)}...</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
