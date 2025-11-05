'use client';

import { use } from 'react';
import { HostLivestreamPage } from '@/presentation/pages/livestream/HostLivestreamPage';

interface HostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function HostPage({ params }: HostPageProps) {
  const { id } = use(params);
  return <HostLivestreamPage livestreamId={id} />;
}
