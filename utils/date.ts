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
