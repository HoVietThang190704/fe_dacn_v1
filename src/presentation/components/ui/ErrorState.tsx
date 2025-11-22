import React from 'react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  retryLabel: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, retryLabel }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="bg-white shadow-lg rounded-2xl px-8 py-10 text-center max-w-md space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-red-500 flex items-center justify-center text-2xl" aria-hidden>
        !
      </div>
      <p className="text-base font-semibold text-gray-900">{message}</p>
      <button onClick={onRetry} className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
        {retryLabel}
      </button>
    </div>
  </div>
);

export default ErrorState;