'use client';

import { useParams } from 'next/navigation';
import type { CommunityPost } from '@/domain/entities/Community';
import { ShareDialog } from '@/presentation/components/share/ShareDialog';

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost;
  onShare: (content?: string) => Promise<void>;
}

export default function SharePostModal({ isOpen, onClose, post, onShare }: SharePostModalProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'vi';

  return (
    <ShareDialog
      open={isOpen}
      onClose={onClose}
      resourceType="post"
      resourceId={post.id}
      locale={locale}
      onInternalShare={onShare}
    />
  );
}
