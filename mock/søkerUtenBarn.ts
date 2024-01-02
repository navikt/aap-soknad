import { Søker } from 'context/sokerOppslagContext';
import { formatDate } from 'utils/date';
import { sub } from 'date-fns';

export const mockSøker: Søker = {
  adresse: 'Tulleveien 239, 0472 Oslo',
  erBeskyttet: false,
  fnr: '10029099999',
  fødselsdato: formatDate(sub(new Date(), { years: 30 }), 'yyyy-MM-dd') || '1990-02-12',
  navn: 'Jackie Li',
};
