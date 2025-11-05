'use client';

import { use } from 'react';
import { WatchLivestreamPage } from '@/presentation/pages/livestream/WatchLivestreamPage';

interface LivestreamWatchProps {
  params: Promise<{
    id: string;
  }>;
}

export default function LivestreamWatch({ params }: LivestreamWatchProps) {
  const { id } = use(params);
  return <WatchLivestreamPage livestreamId={id} />;
}