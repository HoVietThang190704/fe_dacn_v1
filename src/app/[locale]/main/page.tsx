'use client';

import { HomePage } from '@/presentation/pages';

export default function MainHomePage() {
  // HomePage is self-contained and reads localization via next-intl hooks.
  // No need to pass locale as prop here.
  return <HomePage />;
}
