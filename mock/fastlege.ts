import { OppslagBehandler } from 'context/sokerOppslagContext';

export const mockFastlege: OppslagBehandler = {
  type: 'FASTLEGE',
  navn: 'Sonja Plastersen',
  behandlerRef: 'd182f24b-ebca-4f44-bf86-65901ec6141b',
  kontaktinformasjon: {
    kontor: 'Andeby legekontor',
    telefon: '99 99 99 99',
    adresse: {
      adressenavn: 'Skogveien',
      husnummer: '17',
      postnummer: '1234',
      poststed: 'Andeby',
    },
  },
};
