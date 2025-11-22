'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/shared/hooks/useAuth';
import { container } from '@/presentation/di/container';
import { Livestream } from '@/domain/entities/Livestream';
import { LIVESTREAM_CONFIG } from '@/shared/constants/livestream';

const LivestreamHistoryPage: React.FC = () => {
  const t = useTranslations('livestream');
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

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateDuration = (start: Date | string, end: Date | string) => {
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
      <h1 className="text-3xl font-bold mb-6">{t('historyPage.title')}</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((livestream) => (
              <tr key={livestream.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {livestream.title}
                  </div>
                  {livestream.description && (
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {livestream.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {livestream.startTime ? formatDate(livestream.startTime) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {livestream.startTime ? formatTime(livestream.startTime) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {livestream.endTime ? formatTime(livestream.endTime) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {livestream.startTime && livestream.endTime 
                    ? calculateDuration(livestream.startTime, livestream.endTime)
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {livestream.viewerCount || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LivestreamHistoryPage;
