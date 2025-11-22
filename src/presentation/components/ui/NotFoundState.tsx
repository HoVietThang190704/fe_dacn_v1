import React from 'react';

interface NotFoundStateProps {
  title?: string;
  message?: string;
  onBack?: () => void;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({ title = 'Không tìm thấy', message, onBack }) => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 flex items-center justify-center">
    <div className="text-center">
      <div className="text-gray-400 text-6xl mb-4">📦</div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      {message && <p className="text-gray-600 mb-4">{message}</p>}
      <button
        onClick={onBack || (() => window.history.back())}
        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Quay lại đơn hàng
      </button>
    </div>
  </div>
);

export default NotFoundState;
