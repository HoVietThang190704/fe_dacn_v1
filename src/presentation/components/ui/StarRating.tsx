import React from 'react';

export type StarProps = {
  fillPercentage: number;
  sizeClass: string;
};

export const StarIcon: React.FC<StarProps> = ({ fillPercentage, sizeClass }) => (
  <span className={`relative inline-block ${sizeClass}`}>
    <svg
      viewBox="0 0 24 24"
      className="absolute inset-0 text-gray-200"
      fill="currentColor"
    >
      <path d="M12 17.27 18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
    <span
      className="absolute inset-0 overflow-hidden text-orange-500"
      style={{ width: `${fillPercentage}%` }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M12 17.27 18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    </span>
  </span>
);

export const StarRatingDisplay: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
  const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const rawFill = Math.max(0, Math.min(1, rating - index));
        return <StarIcon key={starValue} fillPercentage={rawFill * 100} sizeClass={sizeMap[size]} />;
      })}
    </div>
  );
};
