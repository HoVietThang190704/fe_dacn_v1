"use client";

import React from "react";
import type { useTranslations } from 'next-intl';

interface ProfileTabsProps {
  activeTab: "posts" | "products";
  setActiveTab: (tab: "posts" | "products") => void;
  postsCount: number;
  productsCount: number;
  t: ReturnType<typeof useTranslations> | ((key: string, values?: Record<string, unknown>) => string);
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab, postsCount, productsCount, t }) => (
  <div className="bg-white border-b border-gray-200">
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex gap-8">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-4 px-2 font-medium text-sm relative ${
            activeTab === "posts" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("tabs.posts", { count: postsCount })}
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`py-4 px-2 font-medium text-sm relative ${
            activeTab === "products" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("tabs.products", { count: productsCount })}
        </button>
      </div>
    </div>
  </div>
);

export default ProfileTabs;
