'use client';

import Navbar from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useState, useEffect } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = (isOpen: boolean) => {
    setIsSidebarOpen(isOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuToggle={handleMenuToggle} />
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          isMobile={isMobile}
          onClose={() => setIsSidebarOpen(false)} 
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen && !isMobile ? 'ml-0' : 'ml-0'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}