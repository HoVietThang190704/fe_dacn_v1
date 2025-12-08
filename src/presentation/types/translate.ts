import type { useTranslations } from 'next-intl';

export type TranslateFn =
  | ReturnType<typeof useTranslations>
  | ((key: string, values?: Record<string, unknown>) => string);
