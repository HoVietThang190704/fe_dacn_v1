"use client";

import React from "react";

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "" }) => (
  <div className={`inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin ${className}`} />
);

export default LoadingSpinner;
