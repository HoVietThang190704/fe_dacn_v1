import React from 'react';
import Image from 'next/image';
import type { User } from '@/domain/entities/User';
import { useTranslations } from 'next-intl';
import { ICONS } from '@/shared/constants/images';

interface UsersSectionProps {
  users: User[];
  hasMore: boolean;
  onLoadMore: () => void;
  total: number;
  onUserClick?: (user: User) => void;
  isLoadingMore?: boolean;
}

const UsersSection: React.FC<UsersSectionProps> = ({ users, hasMore, onLoadMore, total, onUserClick, isLoadingMore = false }) => {
  const t = useTranslations('search');

  return (
    <section className="bg-white shadow-sm rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{t('results.users', { count: total })}</h2>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-gray-500">{t('results.noUsersDesc')}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <article
              key={user.id}
              onClick={() => onUserClick?.(user)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onUserClick?.(user); }}
              className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex gap-3 hover:shadow-md cursor-pointer"
            >
              {user.avatar ? (
                <Image src={user.avatar} alt={user.userName ?? user.email ?? t('userFallback')} width={48} height={48} className="rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-500 text-white flex items-center justify-center font-semibold">
                  {(user.userName ?? user.email ?? t('userFallback')).charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.userName ?? t('userFallback')}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {user.phone && <p className="text-xs text-gray-500 truncate">{user.phone}</p>}
              </div>
            </article>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className={`px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 border rounded ${isLoadingMore ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {t('results.loadMore')}
          </button>
        </div>
      )}
    </section>
  );
};

export default UsersSection;
