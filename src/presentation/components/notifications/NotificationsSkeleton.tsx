import React from 'react';
import { NOTIFICATIONS_CONFIG } from '@/presentation/config/notifications.config';

export const NotificationsSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: NOTIFICATIONS_CONFIG.skeletonCount }).map((_, index) => (
      <div key={index} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4">
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-full rounded bg-gray-100" />
        <div className="mt-2 h-3 w-3/4 rounded bg-gray-100" />
      </div>
    ))}
  </div>
);
