import type { useTranslations } from 'next-intl';

export const translateSafely = (
  translate: ReturnType<typeof useTranslations>,
  key: string,
  fallback?: string
): string => {
  try {
    const value = translate(key);
    // Only accept string translations — otherwise fall back
    if (typeof value === 'string' && value !== key) return value;
    return fallback ?? '';
  } catch {
    return fallback ?? '';
  }
};

export const translateWithValues = (
  translate: ReturnType<typeof useTranslations>,
  key: string,
  values: Record<string, string | number | Date>,
  fallback?: string
): string => {
  try {
    const value = translate(key, values);
    if (typeof value === 'string' && value !== key) return value;
    return fallback ?? '';
  } catch {
    return fallback ?? '';
  }
};

export default translateSafely;
