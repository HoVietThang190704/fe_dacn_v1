'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/shared/hooks/useAuth';
import { container } from '@/presentation/di/container';
import { Livestream, LivestreamStatus } from '@/domain/entities/Livestream';
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { io, Socket } from 'socket.io-client';
import { ChatBox, ChatMessage } from '@/components/livestream/ChatBox';
import { API_CONFIG } from '@/shared/constants/api';

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

  // Socket.IO states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const videoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const hasCheckedAuthRef = useRef(false);

  const loadLivestream = useCallback(async () => {
    try {
      setIsLoading(true);
      const getLivestreamByIdUseCase = container.getLivestreamByIdUseCase;
      const data = await getLivestreamByIdUseCase.execute(livestreamId);
      setLivestream(data);

      if (data.hostId !== user?.id) {
        setError(t('errors.notAuthorized'));
        setTimeout(() => router.push('/main/livestream'), 2000);
      }
    } catch (err) {
      console.error('Load livestream error:', err);
      setError(t('errors.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [livestreamId, user?.id, t, router]);

  useEffect(() => {
    // Only check auth once when component mounts and auth is loaded
    if (authLoading) return;
    
    if (!isAuthenticated && !hasCheckedAuthRef.current) {
      console.log('[HostLivestream] Not authenticated, redirecting to login');
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
    if (!livestream) {
      console.error('[HostLivestream] No livestream data available');
      return;
    }

    if (isInitializing) {
      console.log('[HostLivestream] Already initializing, skipping...');
      return;
    }

    setIsInitializing(true);
    setError(''); // Clear any previous errors
    console.log('[HostLivestream] Initializing Agora...');
    console.log('[HostLivestream] Channel:', livestream.channelName);
    console.log('[HostLivestream] Auth token exists:', !!localStorage.getItem('authToken'));

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Trình duyệt không hỗ trợ camera/microphone. Vui lòng sử dụng trình duyệt hiện đại hoặc bật HTTPS.');
        setIsInitializing(false);
        return;
      }

      console.log('[HostLivestream] Step 0: Loading Agora SDK...');
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      
      console.log('[HostLivestream] Step 1: Getting Agora token...');
      const getAgoraTokenUseCase = container.getAgoraTokenUseCase;
      const tokenData = await getAgoraTokenUseCase.execute(
        livestream.channelName,
        0,
        'publisher'
      );
      console.log('[HostLivestream] Token received:', { appId: tokenData.appId, uid: tokenData.uid });

      console.log('[HostLivestream] Step 2: Creating Agora client...');
      const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      clientRef.current = client;

      console.log('[HostLivestream] Step 3: Setting client role to host...');
      await client.setClientRole('host');

      console.log('[HostLivestream] Step 4: Joining channel...');
      await client.join(tokenData.appId, livestream.channelName, tokenData.token, tokenData.uid);

      // Listen for audience members joining/leaving
      client.on('user-joined', (user) => {
        console.log('[HostLivestream] User joined:', user.uid);
        const currentCount = client.remoteUsers.length;
        setViewerCount(currentCount);
      });

      client.on('user-left', (user) => {
        console.log('[HostLivestream] User left:', user.uid);
        const currentCount = client.remoteUsers.length;
        setViewerCount(currentCount);
      });

      console.log('[HostLivestream] Step 5: Creating camera and microphone tracks (this may ask for permission)...');
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      videoTrackRef.current = videoTrack;
      audioTrackRef.current = audioTrack;

      console.log('[HostLivestream] Step 6: Playing video locally...');
      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      console.log('[HostLivestream] Step 7: Publishing tracks...');
      await client.publish([videoTrack, audioTrack]);

      console.log('[HostLivestream] Step 8: Updating livestream status to LIVE...');
      const updateLivestreamStatusUseCase = container.updateLivestreamStatusUseCase;
      await updateLivestreamStatusUseCase.execute(livestreamId, LivestreamStatus.LIVE);

      console.log('[HostLivestream] ✅ Stream started successfully!');
      setIsStreaming(true);
      setIsInitializing(false);
    } catch (err) {
      console.error('[HostLivestream] ❌ Initialize Agora error:', err);
      if (err instanceof Error) {
        console.error('[HostLivestream] Error message:', err.message);
        console.error('[HostLivestream] Error stack:', err.stack);
        
        // Check for permission errors
        if (err.message.includes('Permission') || err.message.includes('NotAllowedError')) {
          setError('Bạn cần cấp quyền truy cập camera và microphone để livestream. Vui lòng kiểm tra cài đặt trình duyệt.');
        } else {
          setError(t('errors.streamInitFailed') + ': ' + err.message);
        }
      } else {
        setError(t('errors.streamInitFailed') + ': Unknown error');
      }
      
      // Clean up on error
      if (videoTrackRef.current) {
        videoTrackRef.current.close();
        videoTrackRef.current = null;
      }
      if (audioTrackRef.current) {
        audioTrackRef.current.close();
        audioTrackRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.leave().catch(console.error);
        clientRef.current = null;
      }
      
      setIsInitializing(false);
    }
  };

  const toggleCamera = async () => {
    if (videoTrackRef.current && clientRef.current) {
      const newState = !isCameraOn;
      
      try {
        console.log('[HostLivestream] 📹 Toggling camera to', newState ? 'ON' : 'OFF');
        
        // Enable/disable the track
        await videoTrackRef.current.setEnabled(newState);
        
        // IMPORTANT: Re-publish to sync state with Agora server
        // This ensures billing is accurate and viewers see the correct state
        if (newState) {
          // Camera ON: Publish video track
          await clientRef.current.publish([videoTrackRef.current]);
          console.log('[HostLivestream] ✅ Video track published');
        } else {
          // Camera OFF: Unpublish video track to stop billing
          await clientRef.current.unpublish([videoTrackRef.current]);
          console.log('[HostLivestream] ✅ Video track unpublished (stops video billing)');
        }
        
        setIsCameraOn(newState);
        console.log('[HostLivestream] 📹 Camera', newState ? 'enabled' : 'disabled');
      } catch (error) {
        console.error('[HostLivestream] ❌ Toggle camera error:', error);
      }
    }
  };

  const toggleMic = async () => {
    if (audioTrackRef.current && clientRef.current) {
      const newState = !isMicOn;
      
      try {
        console.log('[HostLivestream] 🎤 Toggling mic to', newState ? 'ON' : 'OFF');
        
        // Enable/disable the track
        await audioTrackRef.current.setEnabled(newState);
        
        // IMPORTANT: Re-publish to sync state with Agora server
        // This ensures billing is accurate
        if (newState) {
          // Mic ON: Publish audio track
          await clientRef.current.publish([audioTrackRef.current]);
          console.log('[HostLivestream] ✅ Audio track published');
        } else {
          // Mic OFF: Unpublish audio track to stop billing
          await clientRef.current.unpublish([audioTrackRef.current]);
          console.log('[HostLivestream] ✅ Audio track unpublished (stops audio billing)');
        }
        
        setIsMicOn(newState);
        console.log('[HostLivestream] 🎤 Mic', newState ? 'enabled' : 'disabled');
      } catch (error) {
        console.error('[HostLivestream] ❌ Toggle mic error:', error);
      }
    }
  };

  // Socket.IO setup
  useEffect(() => {
    if (!user || !livestreamId) return;

    console.log('[HostLivestream] 🔌 Connecting to socket server...');
    const socketUrl = API_CONFIG.SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const socket = io(socketUrl || undefined, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[HostLivestream] ✅ Socket connected:', socket.id);
      // Join livestream room as host
      socket.emit('join-livestream', {
        livestreamId,
        userId: user.id,
        userName: user.userName || user.email
      });
    });

    // Listen for chat history (loaded from database)
    socket.on('chat-history', (messages: ChatMessage[]) => {
      console.log('[HostLivestream] 📜 Chat history loaded:', messages.length);
      setChatMessages(messages);
    });

    // Listen for new messages
    socket.on('new-message', (message: ChatMessage) => {
      console.log('[HostLivestream] 💬 New message:', message);
      setChatMessages(prev => [...prev, message]);
    });

    // Listen for viewer count updates
    socket.on('viewer-count', ({ viewerCount: count }: { viewerCount: number }) => {
      console.log('[HostLivestream] 👥 Viewer count:', count);
      setViewerCount(count);
    });

    // Listen for user joined
    socket.on('user-joined', ({ userName }: { userName: string }) => {
      console.log('[HostLivestream] 👋 User joined:', userName);
    });

    socket.on('disconnect', () => {
      console.log('[HostLivestream] 🔌 Socket disconnected');
    });

    return () => {
      console.log('[HostLivestream] 🔌 Cleaning up socket...');
      socket.emit('leave-livestream', { livestreamId });
      socket.disconnect();
    };
  }, [user, livestreamId]);

  const handleSendMessage = (message: string) => {
    if (!socketRef.current || !user) return;
    
    console.log('[HostLivestream] 📤 Sending message:', message);
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
        console.log('[HostLivestream] 🛑 Ending stream and cleaning up...');
        
        // Step 1: Unpublish tracks from channel
        if (clientRef.current && (videoTrackRef.current || audioTrackRef.current)) {
          console.log('[HostLivestream] Unpublishing tracks...');
          const tracksToUnpublish = [];
          if (videoTrackRef.current) tracksToUnpublish.push(videoTrackRef.current);
          if (audioTrackRef.current) tracksToUnpublish.push(audioTrackRef.current);
          if (tracksToUnpublish.length > 0) {
            await clientRef.current.unpublish(tracksToUnpublish);
          }
        }

        // Step 2: Stop and close video track
        if (videoTrackRef.current) {
          console.log('[HostLivestream] Stopping video track...');
          videoTrackRef.current.stop();
          videoTrackRef.current.close();
          videoTrackRef.current = null;
        }

        // Step 3: Stop and close audio track
        if (audioTrackRef.current) {
          console.log('[HostLivestream] Stopping audio track...');
          audioTrackRef.current.stop();
          audioTrackRef.current.close();
          audioTrackRef.current = null;
        }

        // Step 4: Leave channel
        if (clientRef.current) {
          console.log('[HostLivestream] Leaving Agora channel...');
          await clientRef.current.leave();
          clientRef.current = null;
        }

        // Step 5: Update backend status
        console.log('[HostLivestream] Updating livestream status to ENDED...');
        const updateLivestreamStatusUseCase = container.updateLivestreamStatusUseCase;
        await updateLivestreamStatusUseCase.execute(livestreamId, LivestreamStatus.ENDED);

        console.log('[HostLivestream] ✅ Stream ended successfully, redirecting...');
        router.push('/main/livestream');
      } catch (err) {
        console.error('[HostLivestream] ❌ End stream error:', err);
        setError(t('errors.endStreamFailed'));
      }
    }
  };

  useEffect(() => {
    // Add a beforeunload handler so that if the user closes the tab/window the client
    // will attempt a best-effort unpublish + leave. This reduces billing/time leak on Agora.
    const handleBeforeUnload = () => {
      try {
        if (clientRef.current) {
          // Best-effort: unpublish any local tracks
          try {
            const tracksToUnpublish: (ICameraVideoTrack | IMicrophoneAudioTrack)[] = [];
            if (videoTrackRef.current) tracksToUnpublish.push(videoTrackRef.current);
            if (audioTrackRef.current) tracksToUnpublish.push(audioTrackRef.current);
            if (tracksToUnpublish.length > 0) {
              // fire-and-forget
              clientRef.current.unpublish(tracksToUnpublish).catch(() => {});
            }
          } catch (err) {
            console.error('[HostLivestream] beforeunload unpublish error', err);
          }

          // Best-effort: leave channel
          try {
            clientRef.current.leave().catch(() => {});
          } catch (err) {
            console.error('[HostLivestream] beforeunload leave error', err);
          }
        }
      } catch (err) {
        console.error('[HostLivestream] beforeunload handler error', err);
      }
      // Do not set returnValue — we don't want a confirmation dialog, just a polite leave.
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      console.log('[HostLivestream] Component unmounting, cleaning up Agora resources...');

      // Cleanup on component unmount (e.g., user navigates away)
      if (clientRef.current && (videoTrackRef.current || audioTrackRef.current)) {
        const tracksToUnpublish: (ICameraVideoTrack | IMicrophoneAudioTrack)[] = [];
        if (videoTrackRef.current) tracksToUnpublish.push(videoTrackRef.current);
        if (audioTrackRef.current) tracksToUnpublish.push(audioTrackRef.current);
        if (tracksToUnpublish.length > 0) {
          clientRef.current.unpublish(tracksToUnpublish).catch(console.error);
        }
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
        clientRef.current.leave().catch(console.error);
        clientRef.current = null;
      }
      
      console.log('[HostLivestream] ✅ Cleanup complete');
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
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl text-white">{error || t('errors.livestreamNotFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <button
                onClick={() => router.push('/main/livestream')}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Quay lại</span>
              </button>
              <h1 className="text-lg sm:text-xl font-bold truncate">{livestream.title}</h1>
              {isStreaming && (
                <span className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-gray-300 bg-gray-700/50 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                <span className="font-semibold text-sm sm:text-base">{viewerCount}</span>
                <span className="text-xs sm:text-sm hidden sm:inline">{t('host.viewers')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Left Column: Video Preview + Controls */}
          <div className="xl:col-span-3 space-y-4">
            {/* Video Preview */}
            <div className="bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video relative">
                <div ref={localVideoRef} className="w-full h-full"></div>
                {!isStreaming && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center px-4">
                      <div className="text-4xl sm:text-6xl mb-4">📹</div>
                      <p className="text-lg sm:text-xl mb-6">{isInitializing ? 'Đang khởi động...' : t('host.readyToStart')}</p>
                      {error && (
                        <div className="mb-4 px-4 sm:px-6 py-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 max-w-md mx-auto">
                          <p className="text-sm">{error}</p>
                        </div>
                      )}
                      <button
                        onClick={initializeAgora}
                        disabled={isInitializing}
                        className={`px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition flex items-center gap-2 mx-auto text-sm sm:text-base ${
                          isInitializing ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isInitializing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang khởi động...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                            </svg>
                            {t('host.startStream')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            {isStreaming && (
              <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
                <button
                  onClick={toggleCamera}
                  className={`p-3 sm:p-4 rounded-full transition ${
                    isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  title={isCameraOn ? t('host.turnOffCamera') : t('host.turnOnCamera')}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    {isCameraOn ? (
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    ) : (
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM2 6c0-1.105.895-2 2-2h.586l2 2H4v8h8v-.586l2 2V14a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm10 4.586l2 2V7a1 1 0 011.447-.894l2 1A1 1 0 0118 8v6a1 1 0 01-.553.894l-.781-.391L12 9.586z" clipRule="evenodd" />
                    )}
                  </svg>
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-3 sm:p-4 rounded-full transition ${
                    isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                  title={isMicOn ? t('host.turnOffMic') : t('host.turnOnMic')}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    {isMicOn ? (
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM7 4a3 3 0 014.905-2.338l-1.524 1.524A1.004 1.004 0 0010 3a1 1 0 00-1 1v.586l-2 2V4zM10 11.414V8a1 1 0 012 0v3.414l-2-2zM15 8a1 1 0 10-2 0 3 3 0 01-3 3 1 1 0 100 2 5.002 5.002 0 005-5z" clipRule="evenodd" />
                    )}
                  </svg>
                </button>

                <button
                  onClick={endStream}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition flex items-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  {t('host.endStream')}
                </button>
              </div>
            )}

            {/* Stream Description (Mobile) */}
            <div className="xl:hidden bg-gray-800/50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Thông tin livestream</h3>
              <p className="text-sm text-gray-300">{livestream.description || 'Chưa có mô tả'}</p>
            </div>
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
