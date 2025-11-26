import { ICONS } from '@/shared/constants/images';

export type ResultStatus = 'success' | 'failed' | 'unknown';

export const STATUS_STYLES: Record<ResultStatus, { icon: string; bg: string; text: string; badge: string }> = {
  success: {
    icon: ICONS.CHECK,
    bg: 'bg-green-50',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
  },
  failed: {
    icon: ICONS.WARNING,
    bg: 'bg-red-50',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800',
  },
  unknown: {
    icon: ICONS.QUESTION,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
  },
};
