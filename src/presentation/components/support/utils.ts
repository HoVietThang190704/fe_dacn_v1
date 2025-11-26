export const isValidObjectId = (value: string): boolean => /^[a-f\d]{24}$/i.test(value);

export const formatDate = (date: Date, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
