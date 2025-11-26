'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/shared/hooks/useAuth';
import { container } from '@/presentation/di/container';
import { Livestream } from '@/domain/entities/Livestream';
import { LIVESTREAM_CONFIG } from '@/shared/constants/livestream';
import Image from 'next/image';

const LivestreamHistoryPage: React.FC = () => {
  const t = useTranslations('livestream');
  const router = useRouter();
  const { user } = useAuth();
  const [history, setHistory] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const useCase = container.getMyLivestreamHistoryUseCase;
        const data = await useCase.execute(user.id);
        setHistory(data);
      } catch (err) {
        console.error('[LivestreamHistory] Error:', err);
        setError(err instanceof Error ? err.message : t('historyPage.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, t]);

  const formatDate = (date?: Date | string | null) => {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date?: Date | string | null) => {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateDuration = (start?: Date | string | null, end?: Date | string | null) => {
    if (!start || !end) return '—';
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / LIVESTREAM_CONFIG.MILLISECONDS_PER_HOUR);
    const minutes = Math.floor((diff % LIVESTREAM_CONFIG.MILLISECONDS_PER_HOUR) / LIVESTREAM_CONFIG.MILLISECONDS_PER_MINUTE);
    
    if (hours > 0) {
      return `${hours} ${t('historyPage.duration.hours')} ${minutes} ${t('historyPage.duration.minutes')}`;
    }
    return `${minutes} ${t('historyPage.duration.minutes')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('historyPage.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t('historyPage.empty')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 ml-3">
        <button type="button" onClick={() => router.back()} className="text-sm text-orange-500 hover:underline">
          {t('backToList')}
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden -mt-4">
        <div className="hidden sm:block">
          <h1 className="text-3xl font-bold mt-2 ml-6">{t('historyPage.title')}</h1>
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('historyPage.table.title')}
                </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('historyPage.table.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('historyPage.table.startTime')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('historyPage.table.endTime')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('historyPage.table.duration')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('historyPage.table.viewers')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('historyPage.table.status')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((livestream) => (
              <tr key={livestream.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      {livestream.thumbnail || livestream.hostAvatar ? (
                        // Use native img for data URLs or next/image for remote
                        (
                          <Image src={livestream.thumbnail || livestream.hostAvatar || ''} alt={livestream.title || 'thumb'} width={48} height={48} className="object-cover" unoptimized />
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">No</div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{livestream.title}</div>
                      {livestream.description && (
                        <div className="text-sm text-gray-500 truncate max-w-md">{livestream.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-gray-700 font-medium">{formatDate(livestream.startTime || livestream.createdAt)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-indigo-600 font-semibold">{formatTime(livestream.startTime || livestream.createdAt)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTime(livestream.endTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {calculateDuration(livestream.startTime || livestream.createdAt, livestream.endTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {livestream.viewerCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${livestream.status === 'ENDED' ? 'bg-green-100 text-green-700' : livestream.status === 'LIVE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}> 
                    {livestream.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <div className="sm:hidden">
          <ul className="divide-y">
            {history.map((livestream) => (
              <li key={livestream.id} className="p-4">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      {livestream.thumbnail || livestream.hostAvatar ? (
                        (
                          <Image src={livestream.thumbnail || livestream.hostAvatar || ''} alt={livestream.title || 'thumb'} width={64} height={64} className="object-cover" unoptimized />
                        )
                      ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">No</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{livestream.title}</div>
                        <div className="text-xs text-gray-500">{livestream.description || t('livestream.noDescription')}</div>
                      </div>
                      <div className="text-right text-xs text-gray-500">{formatTime(livestream.endTime)}</div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <div className="text-gray-400">{t('historyPage.table.date')}</div>
                        <div className="font-medium text-gray-700">{formatDate(livestream.startTime || livestream.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">{t('historyPage.table.startTime')}</div>
                        <div className="font-medium text-indigo-600">{formatTime(livestream.startTime || livestream.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">{t('historyPage.table.duration')}</div>
                        <div className="font-medium text-gray-700">{calculateDuration(livestream.startTime || livestream.createdAt, livestream.endTime)}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="text-gray-500">{(livestream.viewerCount || 0) + ' ' + t('livestream.viewers')}</div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${livestream.status === 'ENDED' ? 'bg-green-100 text-green-700' : livestream.status === 'LIVE' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}> 
                          {livestream.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LivestreamHistoryPage;
