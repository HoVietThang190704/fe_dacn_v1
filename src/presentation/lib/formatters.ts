export const formatCurrency = (value?: number) => {
  if (!value && value !== 0) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const formatRelativeTime = (isoDate: string) => {
  const now = new Date();
  const target = new Date(isoDate);
  const diff = (now.getTime() - target.getTime()) / 1000;

  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} ngày trước`;
  return target.toLocaleDateString('vi-VN');
};
