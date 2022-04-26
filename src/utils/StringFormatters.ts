import { Navn } from '../types/Soknad';

export const formatNavn = (navn: Navn) =>
  `${navn?.fornavn} ${navn?.mellomnavn ? `${navn?.mellomnavn} ` : ''}${navn?.etternavn}`;

export const landNavnFraSelector = (str: string) => str?.split(':')?.[1];
