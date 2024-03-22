import { sub } from 'date-fns';
import { Person } from 'pages/api/oppslagapi/person';
import { formatDate } from 'utils/date';

export const MockPerson: Person = {
  navn: 'Jackie Li',
  fnr: '12345678910',
  adresse: 'Oslo',
  fødseldato: formatDate(sub(new Date(), { years: 30 }), 'yyyy-MM-dd')!,
};
