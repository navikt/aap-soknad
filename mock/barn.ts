import { formatDate } from 'utils/date';
import { sub } from 'date-fns';

export const mockBarn = () => [
  {
    navn: 'Embla Bakke Li',
    fødselsdato: formatDate(sub(new Date(), { years: 1 }), 'yyyy-MM-dd')!,
  },
  {
    navn: 'Jørgen Hatt Emaker',
    fødselsdato: formatDate(sub(new Date(), { years: 4 }), 'yyyy-MM-dd')!,
  },
  {
    navn: 'Jonas Li Ibux',
    fødselsdato: formatDate(sub(new Date(), { years: 2 }), 'yyyy-MM-dd')!,
  },
];
