import type { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { LIVESTREAM_CONFIG } from '@/shared/constants/livestream';

export const cleanupAgoraConnection = async (
  clientRef: React.MutableRefObject<IAgoraRTCClient | null>,
  remoteVideoRef: React.MutableRefObject<HTMLDivElement | null>
) => {
  try {
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

    if (clientRef.current) {
      const remoteUsers = clientRef.current.remoteUsers;

      for (const user of remoteUsers) {
        if (user.audioTrack) {
          try {
            user.audioTrack.stop();
          } catch {
          }
        }
        if (user.videoTrack) {
          try {
            user.videoTrack.stop();
          } catch {
          }
        }
      }

      for (const user of remoteUsers) {
        try {
          if (user.hasAudio) {
            await clientRef.current.unsubscribe(user, 'audio');
          }
          if (user.hasVideo) {
            await clientRef.current.unsubscribe(user, 'video');
          }
        } catch {
        }
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = '';
      }

      await clientRef.current.leave();
      clientRef.current = null;
    }

    document.querySelectorAll('audio, video').forEach(element => {
      element.remove();
    });

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

  } catch {
    if (clientRef.current) {
      try {
        await clientRef.current.leave();
      } catch {
      }
      clientRef.current = null;
    }

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

  await new Promise(resolve => setTimeout(resolve, LIVESTREAM_CONFIG.CLEANUP_DELAY_MS));
};