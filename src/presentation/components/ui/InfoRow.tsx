import React from 'react';

export const InfoRow: React.FC<{ label: string; value: string; compact?: boolean }> = ({ label, value, compact }) => (
  <div className={`flex flex-col ${compact ? 'text-xs' : 'text-sm'}`}>
    <span className="text-gray-400">{label}</span>
    <span className="font-medium text-gray-700">{value || '—'}</span>
  </div>
);
