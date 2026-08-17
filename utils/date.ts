import { endOfMonth, format } from 'date-fns';
import { nb } from 'date-fns/locale';

export const formatDate = (date: any, formatStr = 'dd.MM.yyyy') => {
  if (date) {
    if (typeof date === 'string') {
      return format(new Date(date), formatStr, { locale: nb });
    }
    return format(date, formatStr, { locale: nb });
  }
  return undefined;
};
export const formatDateTime = (date: any, formatStr = 'dd.MM.yyyy HH:mm') => {
  if (typeof date === 'string') {
    return format(new Date(date), formatStr);
  }
  return format(date, formatStr);
};

export const getStartOfMonthInLocalTime = (date?: Date): string => {
  if (!date) {
    return '';
  }
  return format(date, 'yyyy-MM-01');
};

export const getEndOfMonthInLocalTime = (date?: Date): string => {
  if (!date) {
    return '';
  }
  return format(endOfMonth(date), 'yyyy-MM-dd');
};

export const toLocalDateString = (value?: Date | string) => {
  if (!value) return undefined;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const d = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return y && m && day ? `${day}.${m}.${y}` : undefined;
};
