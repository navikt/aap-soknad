import { sub } from 'date-fns';
import { Person } from 'app/api/oppslagapi/person/route';
import { formatDate } from 'utils/date';

export const MockPerson: Person = {
  navn: 'Jackie LiLi',
  fnr: '12345678910',
  adresse: 'Oslo',
  fødseldato: formatDate(sub(new Date(), { years: 30 }), 'yyyy-MM-dd')!,
};
