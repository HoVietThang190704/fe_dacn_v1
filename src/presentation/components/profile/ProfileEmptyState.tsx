"use client";

import React from "react";
import Image from "next/image";

interface ProfileEmptyStateProps {
  iconSrc?: string;
  title: string;
  description?: string;
}

const ProfileEmptyState: React.FC<ProfileEmptyStateProps> = ({ iconSrc, title, description }) => (
  <div className="text-center py-12">
    {iconSrc && (
      <Image src={iconSrc} alt="empty" width={64} height={64} className="mx-auto text-gray-300 mb-4" />
    )}
    <p className="text-gray-500">{title}</p>
    {description && <p className="text-gray-400 text-sm mt-2">{description}</p>}
  </div>
);

export default ProfileEmptyState;
