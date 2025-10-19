"use client";

import React from "react";
import { useTranslations } from "next-intl";

import type { UserProfile } from "@/presentation/viewmodels/useProfileViewModel";
import { Button } from "@/components/ui/Button";

interface ProfilePageProps {
  profile: UserProfile;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile }) => {
  const t = useTranslations("profile");

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">{t("title") || "Your profile"}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("subtitle") || "Manage your account and personal information"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">{t("edit") || "Edit"}</Button>
              <Button variant="outline" size="sm">{t("settings") || "Settings"}</Button>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1 bg-card rounded-lg p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
              {profile.userName?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="text-lg font-semibold text-foreground">{profile.userName}</h2>
            <div className="text-sm text-muted-foreground mt-1">{profile.email}</div>   
          </section>

          <section className="lg:col-span-2 bg-card rounded-lg p-6">
            <h3 className="text-base font-medium text-foreground mb-4">{t("about") || "About"}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Detail label={t("name") || "Name"} value={profile.userName} />
              <Detail label={t("email") || "Email"} value={profile.email} />
              <Detail label={t("phone") || "Phone"} value={profile.phone || "-"} />
              <Detail label={t("role") || "Role"} value={profile.role || "-"} />
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">{t("preferences") || "Preferences"}</h4>
              <p className="text-sm text-muted-foreground">{t("preferencesHelp") || "Manage your language, notifications and other account preferences in Settings."}</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const Detail: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div className="bg-transparent rounded p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm text-foreground mt-1">{value ?? "-"}</div>
  </div>
);

export default ProfilePage;
