import React from 'react';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<Props> = ({ title, description, children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="text-gray-600 mt-2">{description}</p>}
        </div>

        {children}
      </div>
    </div>
  );
};

export default SettingsLayout;
