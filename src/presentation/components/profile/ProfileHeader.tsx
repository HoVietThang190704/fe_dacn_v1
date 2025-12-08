"use client";

import React from "react";
import Image from "next/image";
import type { useTranslations } from 'next-intl';
import { ICONS } from "@/shared/constants/images";

import type { UserProfile } from "@/presentation/viewmodels/useProfileViewModel";

interface ProfileHeaderProps {
  profile: UserProfile;
  canManageShopOrders?: boolean;
  onManageOrdersClick?: () => void;
  canRegisterShopOwner?: boolean;
  onRegisterShopOwnerClick?: () => void;
  t: ReturnType<typeof useTranslations> | ((key: string, values?: Record<string, unknown>) => string);
  isLoading?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  canManageShopOrders = false,
  onManageOrdersClick,
  canRegisterShopOwner = false,
  onRegisterShopOwnerClick,
  t,
  isLoading = false
}) => {
  const renderActionSection = () => {
    if (canManageShopOrders) {
      return (
        <button
          onClick={onManageOrdersClick}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <Image src={ICONS.TRUCK_SIDE || ICONS.SHOPPING_CART || ICONS.PLACEHOLDER} alt="orders" width={16} height={16} />
          <span>{t("manageOrders")}</span>
        </button>
      );
    }

    if (canRegisterShopOwner) {
      return (
        <div className="flex flex-col items-start gap-2 text-left sm:items-end sm:text-right">
          <p className="text-sm text-gray-600">{t('registerShopOwner.ctaDescription')}</p>
          <button
            onClick={onRegisterShopOwnerClick}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-green-300 px-4 py-2 text-sm font-medium text-black shadow-sm transition hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Image src={ICONS.MONITOR} alt="register" width={20} height={20} />
            <span>{t('registerShopOwner.button')}</span>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
            ) : profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.userName || profile.email || "User"}
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                {profile.userName?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            <div className="flex-1">
              {isLoading ? (
                <>
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.userName || profile.email}</h1>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Image src={ICONS.EMAIL_ICON || ICONS.PLACEHOLDER} alt="email" width={16} height={16} />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Image src={ICONS.PHONE_CALL || ICONS.PLACEHOLDER} alt="phone" width={16} height={16} />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {renderActionSection()}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
