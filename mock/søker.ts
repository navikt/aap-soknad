import { sub } from 'date-fns';
import { formatDate } from 'utils/date';

export const mockSøker = {
  søker: {
    navn: {
      fornavn: 'Jackie',
      mellomnavn: '',
      etternavn: 'Li',
    },
    fødselsnummer: '10029099999',
    adresse: {
      adressenavn: 'Tulleveien',
      husbokstav: 'A',
      husnummer: '239',
      postnummer: {
        postnr: '0472',
        poststed: 'Oslo',
      },
    },
    fødseldato: formatDate(sub(new Date(), { years: 30 }), 'yyyy-MM-dd'),
    barn: [
      {
        fnr: '123',
        navn: {
          fornavn: 'Embla',
          mellomnavn: 'Bakke',
          etternavn: 'Li',
        },
        fødseldato: formatDate(sub(new Date(), { years: 1 }), 'yyyy-MM-dd'),
      },
      {
        fnr: '456',
        navn: {
          fornavn: 'Jonas',
          mellomnavn: 'Li',
        },
        fødseldato: formatDate(sub(new Date(), { years: 2 }), 'yyyy-MM-dd'),
      },
    ],
  },
  behandlere: [
    {
      type: 'FASTLEGE',
      navn: { fornavn: 'Sonja', etternavn: 'Plastersen' },
      kategori: 'LEGE',
      kontaktinformasjon: {
        behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
        kontor: 'Andeby legekontor',
        orgnummer: '999999',
        adresse: {
          adressenavn: 'Skogveien',
          husnummer: '17',
          postnummer: {
            postnr: '1234',
            poststed: 'Andeby',
          },
        },
        telefon: '99 99 99 99',
      },
    },
  ],
  kontaktinformasjon: {
    målform: 'NB',
    reservert: true,
    kanVarsles: true,
    epost: 'navn@epost.no',
    mobil: '99999999',
  },
};
