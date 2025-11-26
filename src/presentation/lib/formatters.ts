export const formatCurrency = (value?: number) => {
  if (!value && value !== 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const formatRelativeTime = (isoDate: string, locale: string = 'vi') => {
  const now = new Date();
  const target = new Date(isoDate);
  const seconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (Number.isNaN(seconds) || seconds < 0) return target.toLocaleDateString(locale);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (seconds < 60) return rtf.format(0, 'second');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  if (days < 30) return rtf.format(-days, 'day');
  return target.toLocaleDateString(locale);
};
