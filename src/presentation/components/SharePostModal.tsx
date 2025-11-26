'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import SharePostModalView from './SharePostModal/SharePostModalView';
import type { CommunityPost } from '@/domain/entities/Community';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost;
  onShare: (content?: string) => Promise<void>;
}

export default function SharePostModal({ isOpen, onClose, post, onShare }: SharePostModalProps) {
  const [shareContent, setShareContent] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const t = useTranslations('community');

  if (!isOpen) return null;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      await onShare(shareContent.trim() || undefined);
      onClose();
      setShareContent('');
    } catch (err) {
      console.error('Error sharing:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <SharePostModalView
      isOpen={isOpen}
      onClose={onClose}
      post={post}
      shareContent={shareContent}
      setShareContent={setShareContent}
      isSharing={isSharing}
      onShare={handleShare}
      t={t}
    />
  );
}
