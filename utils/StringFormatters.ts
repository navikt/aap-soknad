import { Navn } from 'types/Soknad';
import { Adresse } from 'context/sokerOppslagContext';

export const formatNavn = (navn?: Navn) =>
  `${navn?.fornavn || ''}${navn?.mellomnavn ? ` ${navn?.mellomnavn}` : ''} ${
    navn?.etternavn || ''
  }`;

export const landNavnFraSelector = (str: string) => str?.split(':')?.[1];

export const getFullAdresse = (adresse?: Adresse) =>
  `${adresse?.adressenavn} ${adresse?.husnummer}${adresse?.husbokstav ? adresse.husbokstav : ''}, ${
    adresse?.postnummer?.postnr
  } ${adresse?.postnummer?.poststed}`;
