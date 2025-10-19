import React from 'react';
import SortDropdownUI, { Option } from './SortDropdown.ui';

interface Props {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
  matchButtonWidth?: boolean;
  align?: 'left' | 'right';
}

export const SortDropdown: React.FC<Props> = ({ value, options, onChange, className, matchButtonWidth, align }) => {
  const [open, setOpen] = React.useState(false);

  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  return (
    <div ref={ref}>
      <SortDropdownUI
        value={value}
        open={open}
        onToggle={() => setOpen((s) => !s)}
        onSelect={(v) => { onChange(v); setOpen(false); }}
        options={options}
        className={className}
        matchButtonWidth={matchButtonWidth}
        align={align}
      />
    </div>
  );
};

export default SortDropdown;
