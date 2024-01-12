import { Navn } from 'types/Soknad';
import { Adresse, NyAdresse } from 'context/sokerOppslagContext';

export const formatNavn = (navn?: Navn) =>
  `${navn?.fornavn || ''}${navn?.mellomnavn ? ` ${navn?.mellomnavn}` : ''} ${
    navn?.etternavn || ''
  }`;

export const landNavnFraSelector = (str?: string) => str?.split(':')?.[1];

export const formatFullAdresse = (adresse?: Adresse) =>
  `${adresse?.adressenavn}${adresse?.husnummer || adresse?.husbokstav ? ' ' : ''}${
    adresse?.husnummer ?? ''
  }${adresse?.husbokstav ? adresse.husbokstav : ''}${
    adresse?.postnummer?.postnr || adresse?.postnummer?.poststed ? ',' : ''
  } ${adresse?.postnummer?.postnr ?? ''} ${adresse?.postnummer?.poststed ?? ''}`;
export const formatNyAdresse = (adresse?: NyAdresse) =>
  `${adresse?.adressenavn}${adresse?.husnummer || adresse?.husbokstav ? ' ' : ''}${
    adresse?.husnummer ?? ''
  }${adresse?.husbokstav ? adresse.husbokstav : ''}${adresse?.postnummer ? ',' : ''} ${
    adresse?.postnummer ?? ''
  } ${adresse?.poststed ?? ''}`;

export const formatTelefonnummer = (telefonnummer?: string) => {
  if (!telefonnummer) {
    return '';
  }
  if (telefonnummer.startsWith('+47')) {
    return telefonnummer.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  if (telefonnummer.length === 8) {
    if (telefonnummer.startsWith('800')) {
      return telefonnummer.replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3');
    }
    return telefonnummer.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }
  return telefonnummer;
};
