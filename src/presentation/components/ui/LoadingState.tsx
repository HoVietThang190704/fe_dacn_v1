import React from 'react';
import { LOADING_ICON_CLASS } from '@/presentation/config/favoritesConfig';

interface LoadingStateProps {
  message: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center space-y-3">
      <div className={`mx-auto rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin ${LOADING_ICON_CLASS}`} aria-hidden />
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  </div>
);

export default LoadingState;