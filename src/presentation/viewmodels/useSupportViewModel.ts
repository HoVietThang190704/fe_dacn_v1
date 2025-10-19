'use client';

import { useState, useEffect } from 'react';
import { GetSupportDataUseCase } from '@/domain/usecases/GetSupportTicketsUseCase';
import { SupportTicket, FAQ } from '@/domain/entities/Support';

export const useSupportViewModel = (
  getSupportDataUseCase: GetSupportDataUseCase,
  userId: string
) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tickets' | 'faqs'>('faqs');

  const loadSupportData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { tickets, faqs } = await getSupportDataUseCase.execute(userId);
      setTickets(tickets);
      setFaqs(faqs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load support data');
      console.error('Error loading support data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupportData();
  }, [userId]);

  return {
    tickets,
    faqs,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    refresh: loadSupportData,
  };
};
