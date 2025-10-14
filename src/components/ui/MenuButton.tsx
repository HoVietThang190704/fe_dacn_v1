'use client';

import { useState, useEffect } from 'react';

interface MenuButtonProps {
  onToggle?: (isOpen: boolean) => void;
  isOpen?: boolean;
}

export function MenuButton({ onToggle, isOpen: isOpenProp }: MenuButtonProps) {
  const [isMobile, setIsMobile] = useState(false);
  const isOpen = isOpenProp ?? false;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; 
      setIsMobile(mobile);
    };
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    const newState = !isOpen;
    onToggle?.(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className="group relative p-2 text-primary-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 active:scale-95"
      aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1.5">
        <span
          className={`block h-0.5 w-6 bg-primary-foreground transition-all duration-300 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-primary-foreground transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-primary-foreground transition-all duration-300 ease-in-out ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </div>
      {!isMobile && (
        <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border">
          {isOpen ? 'Thu gọn' : 'Mở rộng'}
        </span>
      )}
    </button>
  );
}
