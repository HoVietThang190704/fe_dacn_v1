import Image from 'next/image';
import React from 'react';

type Props = {
  iconSrc: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export const TabButton: React.FC<Props> = ({ iconSrc, isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-orange-500 text-white shadow-sm' : 'bg-transparent text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Image src={iconSrc} alt={String(children)} width={18} height={18} className="h-4 w-4" />
    {children}
  </button>
);

export default TabButton;
