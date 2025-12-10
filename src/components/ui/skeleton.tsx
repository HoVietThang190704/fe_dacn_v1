import React from 'react';

type Props = React.HTMLAttributes<HTMLDivElement>;

const Skeleton: React.FC<Props> = ({ className = '', ...props }) => {
  return (
    <div
      data-slot="skeleton"
      className={[
        'bg-gray-200/70 dark:bg-gray-700/60',
        'animate-pulse',
        'rounded-md',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    />
  );
};

export default Skeleton;
