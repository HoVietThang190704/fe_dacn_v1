'use client';

import { HomePage } from '@/presentation/pages';
import { useParams } from 'next/navigation';

export default function MainHomePage() {
  const params = useParams();
  const locale = params.locale as string;

  return <HomePage locale={locale} />;
}
