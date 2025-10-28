"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import SettingsLayout from "@/presentation/components/settings/SettingsLayout";
import SettingsNav from "@/presentation/components/settings/SettingsNav";
import SettingsSections from "@/presentation/components/settings/SettingsSections";
import { ICONS } from "@/shared/constants/images";

interface SettingsPageProps {
  userId: string;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ userId }) => {
  const t = useTranslations("settings");
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "preferences">("profile");

  const tabs = [
    { key: "profile", label: t("profile") || "Hồ sơ", icon: ICONS.USERS },
    { key: "security", label: t("security") || "Bảo mật", icon: ICONS.SETTINGS },
    { key: "notifications", label: t("notifications") || "Thông báo", icon: ICONS.BELL },
    { key: "preferences", label: t("preferences") || "Tùy chọn", icon: ICONS.SETTINGS },
  ];

  return (
    <SettingsLayout title={t("title") || "Cài đặt"} description={t("settingsDesc") || "Quản lý tài khoản & cài đặt"}>
      <div className="flex flex-col lg:flex-row gap-6">
        <SettingsNav tabs={tabs as any} active={activeTab} onChange={(k) => setActiveTab(k)} />

        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
            <SettingsSections activeTab={activeTab} userId={userId} />
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default SettingsPage;

