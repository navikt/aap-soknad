import { format } from 'date-fns';

export const formatDate = (date: any, formatStr = 'dd.MM.yyyy') => {
  if (date) {
    if (typeof date === 'string') {
      return format(new Date(date), formatStr);
    }
    return format(date, formatStr);
  }
  return undefined;
};
