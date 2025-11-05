import React from 'react';
import TimezoneSelect, { ITimezone } from 'react-timezone-select';
import { Button } from '@/components/ui';

export const ToggleSwitch: React.FC<{
  label: string;
  description?: string;
  enabled: boolean;
  onToggle?: (next: boolean) => void;
}> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className="flex-1">
      <div className="font-medium text-gray-800 dark:text-gray-200">{label}</div>
      {description && <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</div>}
    </div>
    <button
      aria-pressed={enabled}
      onClick={() => onToggle?.(!enabled)}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-sm ${enabled ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`}>
      <span className={`absolute top-1 left-1 w-5 h-5 bg-white dark:bg-gray-800 rounded-full shadow-md transition-all duration-300 ${enabled ? 'transform translate-x-7' : ''}`} />
    </button>
  </div>
);

export const DeviceItem: React.FC<{
  name: string;
  location: string;
  time: string;
  isCurrent?: boolean;
  t: (key: string) => string | undefined;
}> = ({ name, location, time, isCurrent, t }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex gap-4">
      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">💻</div>
      <div>
        <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">{name} {isCurrent && <span className="ml-2 text-xs sm:text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">{t('current') || 'Hiện tại'}</span>}</div>
        <div className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{location}</div>
        <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">{time}</div>
      </div>
    </div>
    {!isCurrent && (
      <div className="w-full sm:w-auto">
        <Button variant="outline" size="sm" className="mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto border-red-200 dark:border-red-700 text-red-600 dark:text-red-400">{t('logout') || 'Đăng xuất'}</Button>
      </div>
    )}
  </div>
);

export const TimeZoneSelector: React.FC<{
  label?: string;
  value?: ITimezone | string;
  onChange?: (timezone: ITimezone) => void;
}> = ({ label, value, onChange }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}
    <TimezoneSelect
      // @ts-expect-error react-timezone-select accepts string or ITimezone
      value={value}
      onChange={onChange}
      className="w-full"
      styles={{
        control: (provided) => ({
          ...provided,
          borderRadius: '0.75rem',
          borderColor: '#e5e7eb',
          backgroundColor: 'white',
          color: '#374151',
          '&:hover': {
            borderColor: '#3b82f6',
          },
          '&:focus-within': {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.5)',
          },
        }),
        menu: (provided) => ({
          ...provided,
          borderRadius: '0.5rem',
          backgroundColor: 'white',
          borderColor: '#e5e7eb',
        }),
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
          color: state.isSelected ? 'white' : '#374151',
        }),
        singleValue: (provided) => ({
          ...provided,
          color: '#374151',
        }),
        input: (provided) => ({
          ...provided,
          color: '#374151',
        }),
        placeholder: (provided) => ({
          ...provided,
          color: '#6b7280',
        }),
      }}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: '#3b82f6',
          primary75: '#60a5fa',
          primary50: '#93c5fd',
          primary25: '#dbeafe',
          danger: '#ef4444',
          dangerLight: '#fca5a5',
          neutral0: 'white',
          neutral5: '#f9fafb',
          neutral10: '#f3f4f6',
          neutral20: '#e5e7eb',
          neutral30: '#d1d5db',
          neutral40: '#9ca3af',
          neutral50: '#6b7280',
          neutral60: '#4b5563',
          neutral70: '#374151',
          neutral80: '#1f2937',
          neutral90: '#111827',
        },
      })}
    />
  </div>
);
