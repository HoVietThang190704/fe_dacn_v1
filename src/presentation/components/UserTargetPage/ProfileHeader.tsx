import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Icon } from './iconHelper';
import type { UserProfile } from '@/presentation/viewmodels/useProfileViewModel';

type Props = {
  profile: UserProfile;
};

const ProfileHeader: React.FC<Props> = ({ profile }) => {
  const t = useTranslations('profile');

  const displayEmail = profile.email ?? t('email');

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={profile.userName ?? profile.email ?? t('userFallback')}
              width={100}
              height={100}
              className="w-24 h-24 rounded-full object-cover"
            />
            ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
              {profile.userName?.charAt(0).toUpperCase() ?? t('userFallback').charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile.userName}</h1>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Icon name={'EMAIL_ICON'} alt={t('email')} width={16} height={16} />
                <span>{displayEmail}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name={'PHONE_CALL'} alt={t('phone')} width={16} height={16} />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
