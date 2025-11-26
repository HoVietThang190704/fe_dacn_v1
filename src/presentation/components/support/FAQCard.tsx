import Image from 'next/image';
import React, { useState } from 'react';
import { ICONS } from '@/shared/constants/images';

import type { FAQ } from '@/domain/entities/Support';

type TranslationFn = (key: string, values?: Record<string, string | number | Date>) => string;

type Props = {
  faq: FAQ;
  t: TranslationFn;
  onVote: (faqId: string, vote: 'helpful' | 'not_helpful') => void | Promise<void>;
  isVoting: boolean;
  voteError: string | null;
  clearVoteError: () => void;
};

export const FAQCard: React.FC<Props> = ({ faq, t, onVote, isVoting, voteError, clearVoteError }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    if (voteError) clearVoteError();
    setIsExpanded((prev) => !prev);
  };

  const handleVote = (vote: 'helpful' | 'not_helpful') => {
    if (isVoting || faq.userVote === vote) return;
    onVote(faq.id, vote);
  };

  const helpfulSelected = faq.userVote === 'helpful';
  const notHelpfulSelected = faq.userVote === 'not_helpful';

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <button onClick={handleToggle} className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{faq.question}</h3>
          <span className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{faq.category}</span>
        </div>
          <Image src={ICONS.ARROW_RIGHT} alt={t('icons.expandAlt') ?? ''} width={20} height={20} className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <p className="mt-4 text-sm leading-relaxed text-gray-700">{faq.answer}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="font-medium text-gray-600">{t('helpfulQuestion')}</span>

            <button
              type="button"
              onClick={() => handleVote('helpful')}
              disabled={isVoting}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                helpfulSelected
                  ? 'border-green-500 bg-green-50 text-green-600'
                  : 'border-transparent bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              } ${isVoting ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <Image src={ICONS.LIKE} alt={t('icons.likeAlt') ?? ''} width={16} height={16} />
              <span>{faq.helpful}</span>
            </button>

            <button
              type="button"
              onClick={() => handleVote('not_helpful')}
              disabled={isVoting}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                notHelpfulSelected
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-transparent bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              } ${isVoting ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <Image src={ICONS.DISLIKE} alt={t('icons.dislikeAlt') ?? ''} width={16} height={16} />
              <span>{faq.notHelpful}</span>
            </button>

            {faq.userVote && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">
                {faq.userVote === 'helpful' ? t('yes') : t('no')}
              </span>
            )}

            {voteError && <span className="text-sm font-medium text-red-500">{voteError}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQCard;
