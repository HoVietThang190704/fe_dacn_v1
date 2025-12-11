import React from 'react';
 
import Icon from './Icon';
import { useTranslations } from 'next-intl';

interface VideoPreviewProps {
  localVideoRef: React.RefObject<HTMLDivElement | null>;
  isStreaming?: boolean;
  isInitializing?: boolean;
  error?: string;
  onStart?: () => Promise<void> | void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ localVideoRef, isStreaming, isInitializing, error, onStart }) => {
  const t = useTranslations('livestream');

  return (
    <div className="bg-black w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
      <div className="relative h-[70vh] w-full sm:h-auto aspect-[9/16] sm:aspect-video">
        <div ref={localVideoRef} className="absolute inset-0 w-full h-full" />
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center px-4 z-30">
              <div className="mb-4 flex justify-center">
                <Icon name={('VIDEO_CAMERA_ALT' as const)} alt={t('livestream.playAlt') as string} width={64} height={64} className="w-12 h-12 sm:w-16 sm:h-16 mb-2" />
              </div>
              <p className="text-lg sm:text-xl mb-6">{isInitializing ? t('initializing') : t('host.readyToStart')}</p>
              {error && (
                <div className="mb-4 px-4 sm:px-6 py-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 max-w-md mx-auto">
                  <p className="text-sm">{error}</p>
                </div>
              )}
              <button
                onClick={onStart}
                disabled={isInitializing}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition flex items-center gap-2 mx-auto text-sm sm:text-base ${
                  isInitializing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isInitializing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('initializing')}
                  </>
                ) : (
                  <>
                    {t('host.startStream')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;
