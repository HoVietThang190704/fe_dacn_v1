import Image from 'next/image';
import React from 'react';

type Props = {
  iconSrc: string;
  title: string;
  description: string;
  onClick?: () => void;
  actionLabel?: string | null;
};

export const QuickActionCard: React.FC<Props> = ({ iconSrc, title, description, onClick, actionLabel = null }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
          <Image src={iconSrc} alt={title} width={28} height={28} className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          {actionLabel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick();
              }}
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-orange-500 transition hover:text-orange-600"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionCard;
