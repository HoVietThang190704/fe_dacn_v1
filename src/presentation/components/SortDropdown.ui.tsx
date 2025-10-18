import React from 'react';

export interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  options: Option[];
  className?: string;
  matchButtonWidth?: boolean;
  align?: 'left' | 'right';
}

export const SortDropdownUI: React.FC<Props> = ({ value, open, onToggle, onSelect, options, className, matchButtonWidth = false, align = 'left' }) => {
  return (
    <div className={`${className ?? ''} relative inline-block`}>
      <button
        type="button"
        onClick={onToggle}
        className="px-3 py-1.5 border rounded outline-none hover:bg-gray-50 flex items-center gap-2"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="text-sm">{value}</span>
        <span className="text-xs">▾</span>
      </button>

      {open && (
        <div className={`${matchButtonWidth ? 'absolute mt-2 min-w-full' : 'absolute mt-2 w-44'} bg-white border rounded shadow-md z-40 ${align === 'left' ? 'left-0' : 'right-0'}`}>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdownUI;
