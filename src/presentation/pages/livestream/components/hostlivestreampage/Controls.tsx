import React from 'react';
import Icon from './Icon';
import { useTranslations } from 'next-intl';

interface ControlsProps {
  isCameraOn: boolean;
  isMicOn: boolean;
  onToggleCamera: () => Promise<void> | void;
  onToggleMic: () => Promise<void> | void;
  onEndStream: () => Promise<void> | void;
}

export const Controls: React.FC<ControlsProps> = ({ isCameraOn, isMicOn, onToggleCamera, onToggleMic, onEndStream }) => {
  const t = useTranslations('livestream');

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
      <button
        onClick={onToggleCamera}
        className={`p-3 sm:p-4 rounded-full transition ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
        title={isCameraOn ? t('host.turnOffCamera') : t('host.turnOnCamera')}
        aria-label={isCameraOn ? t('host.turnOffCamera') : t('host.turnOnCamera')}
      >
        <Icon name={isCameraOn ? ('VIDEO_CAMERA_ALT' as const) : ('NO_CAMERA' as const)} alt={isCameraOn ? t('host.turnOffCamera') as string : t('host.turnOnCamera') as string} width={28} height={28} />
      </button>

      <button
        onClick={onToggleMic}
        className={`p-3 sm:p-4 rounded-full transition ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
        title={isMicOn ? t('host.turnOffMic') : t('host.turnOnMic')}
        aria-label={isMicOn ? t('host.turnOffMic') : t('host.turnOnMic')}
      >
        <Icon name={isMicOn ? ('MICROPHONE' as const) : ('NO_MICRO_PHONE' as const)} alt={isMicOn ? t('host.turnOffMic') as string : t('host.turnOnMic') as string} width={28} height={28} />
      </button>

      <button
        onClick={onEndStream}
        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition flex items-center gap-2 text-sm sm:text-base"
        aria-label={t('host.endStream')}
      >
        {t('host.endStream')}
      </button>
    </div>
  );
};

export default Controls;
