import { format } from 'date-fns';
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
