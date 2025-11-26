import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ICONS } from '@/shared/constants/images';

type TabKey = 'profile' | 'security' | 'notifications' | 'preferences';

interface Tab {
  key: TabKey;
  label: string;
  icon?: string;
}

interface Props {
  tabs: Tab[];
  active: TabKey;
  onChange: (key: TabKey) => void;
}

export const SettingsNav: React.FC<Props> = ({ tabs, active, onChange }) => {
  const t = useTranslations('settings');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);
  return (
    <>
      <aside className="hidden lg:block lg:w-1/4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-sm ${
                  active === tab.key
                    ? 'bg-green-100 text-green-700 border-l-4 border-green-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Image src={tab.icon || (tab.key === 'profile' ? ICONS.USERS : tab.key === 'security' ? ICONS.SETTINGS : tab.key === 'notifications' ? ICONS.BELL : ICONS.PREFERENCES)} alt={tab.label} width={20} height={20} className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
      <div className="lg:hidden sticky top-16 z-10 left-0 right-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative" ref={containerRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((v) => !v)}
              className="w-full bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-2 flex items-center justify-between gap-2 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{tabs.find((tab) => tab.key === active)?.label}</span>
              </div>
              <Image src={ICONS.ARROW_RIGHT} alt={isOpen ? t('collapse') : t('expand')} width={16} height={16} className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div role="menu" className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      onChange(tab.key);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 ${active === tab.key ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                  >
                    <Image src={tab.icon || (tab.key === 'profile' ? ICONS.USERS : tab.key === 'security' ? ICONS.SETTINGS : tab.key === 'notifications' ? ICONS.BELL : ICONS.PREFERENCES)} alt={tab.label} width={18} height={18} className="w-4.5 h-4.5" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsNav;
