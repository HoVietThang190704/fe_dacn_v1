'use client';

import { useState, useEffect } from 'react';

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animated progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 50);

    // Hide loader after delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 backdrop-blur-sm">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-green-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      <div className="relative flex flex-col items-center gap-6 p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-green-100">
        {/* Animated Farm Icon */}
        <div className="relative">
          {/* Outer rotating circle */}
          <div className="w-24 h-24 border-4 border-transparent border-t-green-500 border-r-emerald-400 rounded-full animate-spin"></div>
          
          {/* Middle rotating circle (opposite direction) */}
          <div className="absolute inset-2 border-4 border-transparent border-b-green-400 border-l-teal-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          
          {/* Farm/Leaf Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-green-600 animate-pulse" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66 .95-2.3c.48.17.98.3 1.34.30C14 20 15 4 15 4s5 4 5 10c0 3.25-2.25 5.5-5.5 5.5-.5 0-1-.05-1.5-.16v2.02c.5.08 1 .14 1.5.14 4.42 0 8-3.58 8-8 0-6.5-6-10-8-10z"/>
            </svg>
          </div>
        </div>
        
        {/* Loading Text with Animation */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-semibold text-lg">Đang tải</span>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out"
              style={{width: `${progress}%`}}
            ></div>
          </div>
       </div>
      </div>
    </div>
  );
}
