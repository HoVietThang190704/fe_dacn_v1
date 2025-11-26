import React from 'react';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';
import { useTranslations } from 'next-intl';
import { User } from '@/shared/hooks/useAuth';

type Props = {
  user?: User | null;
  avatarFailed: boolean;
  setAvatarFailed: (failed: boolean) => void;
};

export const HostInfo: React.FC<Props> = ({ user, avatarFailed, setAvatarFailed }) => {
  const t = useTranslations('livestream');
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('hostInfo')}</h3>
      <div className="flex items-center gap-3">
        {user?.avatar && !avatarFailed ? (
          <Image
            src={user.avatar}
            alt={user.userName || user.email}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover"
            onError={() => setAvatarFailed(true)}
            unoptimized
          />
        ) : (
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">
            <Image src={ICONS.PLACEHOLDER} alt={t('hostInfo')} width={24} height={24} />
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{user?.userName || user?.email}</p>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
      </div>
    </div>
  );
};
