'use client';

import React from 'react';
import Icon from '@/presentation/components/ui/Icon';
import { useTranslations } from 'next-intl';
import { ManagedOrderFilterStatus } from '@/presentation/viewmodels/useManagedOrdersViewModel';
import { getFilterOptions, PAGE_SIZES } from '../constants';

type Props = {
  t: ReturnType<typeof useTranslations>;
  searchInput: string;
  setSearchInput: (v: string) => void;
  onSubmitSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  filterStatus: ManagedOrderFilterStatus;
  setFilterStatus: (v: ManagedOrderFilterStatus) => void;
  limit: number;
  setLimit: (v: number) => void;
  pagination?: { totalPages: number; total: number } | null;
  isLoading?: boolean;
};

export const ManagedOrdersToolbar: React.FC<Props> = ({ t, searchInput, setSearchInput, onSubmitSearch, filterStatus, setFilterStatus, limit, setLimit, pagination }) => {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[2fr_1fr] lg:items-center">
      <form onSubmit={onSubmitSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('searchPlaceholder', { defaultValue: 'Tìm theo mã đơn, khách hàng, số điện thoại...' })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            <Icon name="SEARCH" width={18} height={18} alt={t('actions.search')}
            />
          </span>
        </div>
        <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600">
          {t('actions.search', { defaultValue: 'Tìm kiếm' })}
        </button>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          {t('filterTitle', { defaultValue: 'Bộ lọc trạng thái' })}
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as ManagedOrderFilterStatus)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            {getFilterOptions(t).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {pagination && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            {t('eachPage', { defaultValue: 'Mỗi trang' })}
            <select value={limit} onChange={(event) => setLimit(Number(event.target.value))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200">
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  );
};

export default ManagedOrdersToolbar;
