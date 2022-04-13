import { Navn } from '../types/Soknad';

export const formatNavn = (navn: Navn) =>
  `${navn?.fornavn} ${navn?.mellomnavn ? `${navn?.mellomnavn} ` : ''}${navn?.etternavn}`;
