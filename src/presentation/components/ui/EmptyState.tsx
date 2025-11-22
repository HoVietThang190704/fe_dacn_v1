import React from 'react';
import { EMPTY_ICON_CLASS } from '@/presentation/config/favoritesConfig';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white shadow-lg rounded-3xl px-8 py-10 text-center max-w-md space-y-4">
      <div className={`mx-auto rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-2xl ${EMPTY_ICON_CLASS}`} aria-hidden>
        ♥
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <button onClick={onAction} className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition">
        {actionLabel}
      </button>
    </div>
  </div>
);

export default EmptyState;