import { sub } from 'date-fns';
import { formatDate } from '../src/utils/date';

export const mockSøker = {
  søker: {
    navn: {
      fornavn: 'Fornavn',
      mellomnavn: 'Fra',
      etternavn: 'Oppslag',
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
          fornavn: 'Barn',
          mellomnavn: 'Nummer',
          etternavn: 'En',
        },
        fødseldato: formatDate(sub(new Date(), { years: 1 }), 'yyyy-MM-dd'),
      },
      {
        fnr: '456',
        navn: {
          fornavn: 'Barn',
          mellomnavn: 'Nummer',
          etternavn: 'To',
        },
        fødseldato: formatDate(sub(new Date(), { years: 2 }), 'yyyy-MM-dd'),
      },
      {
        fnr: '789',
        navn: {
          fornavn: 'Barn',
          mellomnavn: 'Nummer',
          etternavn: 'Tre',
        },
        fødseldato: formatDate(sub(new Date(), { years: 3 }), 'yyyy-MM-dd'),
      },
      {
        fnr: '012',
        navn: {
          fornavn: 'Barn',
          mellomnavn: 'Nummer',
          etternavn: 'Fire',
        },
        fødseldato: formatDate(sub(new Date(), { years: 4 }), 'yyyy-MM-dd'),
      },
    ],
  },
  behandlere: [
    {
      type: 'FASTLEGE',
      navn: { fornavn: 'Nina Unni', etternavn: 'Borge' },
      kontaktinformasjon: {
        behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
        kontor: 'ASKØY KOMMUNE SAMFUNNSMEDISINSK AVD ALMENNLEGETJENESTEN',
        orgnummer: '976673867',
        adresse: {
          adressenavn: 'Kleppeveien',
          husnummer: '17',
          postnummer: {
            postnr: '5300',
            poststed: 'KLEPPESTØ',
          },
        },
        telefon: '56 15 83 10',
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
