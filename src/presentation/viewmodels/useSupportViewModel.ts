'use client';

import { useState, useEffect } from 'react';
import { GetSupportDataUseCase } from '@/domain/usecases/GetSupportTicketsUseCase';
import { CreateSupportTicketUseCase } from '@/domain/usecases/CreateSupportTicketUseCase';
import { VoteSupportFaqUseCase } from '@/domain/usecases/VoteSupportFaqUseCase';
import { SupportTicket, FAQ, CreateSupportTicketInput } from '@/domain/entities/Support';

interface UseSupportViewModelOptions {
  locale?: string;
}

export const useSupportViewModel = (
  getSupportDataUseCase: GetSupportDataUseCase,
  createSupportTicketUseCase: CreateSupportTicketUseCase,
  voteSupportFaqUseCase: VoteSupportFaqUseCase,
  options: UseSupportViewModelOptions = {}
) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tickets' | 'faqs'>('faqs');
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [votingFaqId, setVotingFaqId] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<{ faqId: string; message: string } | null>(null);

  const loadSupportData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { tickets, faqs } = await getSupportDataUseCase.execute({
        locale: options.locale,
      });
      setTickets(tickets);
      setFaqs(faqs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load support data';
      setError(message);
      console.error('Error loading support data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async (input: CreateSupportTicketInput) => {
    try {
      setIsCreating(true);
      setCreationError(null);
      const ticket = await createSupportTicketUseCase.execute(input);
      setTickets((prev) => [ticket, ...prev]);
      setActiveTab('tickets');
      return ticket;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create support ticket';
      setCreationError(message);
      console.error('Error creating support ticket:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const voteOnFaq = async (faqId: string, vote: 'helpful' | 'not_helpful') => {
    try {
      const target = faqs.find((item) => item.id === faqId);
      if (target && target.userVote === vote) {
        return;
      }
      setVotingFaqId(faqId);
  setVoteError(null);
  const result = await voteSupportFaqUseCase.execute(faqId, vote);
      setFaqs((prev) =>
        prev.map((faq) =>
          faq.id === result.faqId
            ? {
                ...faq,
                helpful: result.helpful,
                notHelpful: result.notHelpful,
                userVote: result.userVote ?? null,
              }
            : faq
        )
      );
    } catch (err) {
  const message = err instanceof Error ? err.message : 'Failed to submit feedback';
  setVoteError({ faqId, message });
      console.error('Error voting FAQ:', err);
      throw err;
    } finally {
      setVotingFaqId(null);
    }
  };

  useEffect(() => {
    loadSupportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.locale]);

  return {
    tickets,
    faqs,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    refresh: loadSupportData,
    createTicket,
    isCreating,
    creationError,
    clearCreationError: () => setCreationError(null),
    voteOnFaq,
    votingFaqId,
    voteError,
    clearVoteError: () => setVoteError(null),
  };
};
