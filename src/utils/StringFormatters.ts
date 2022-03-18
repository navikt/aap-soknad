import { Navn } from '../types/SoknadStandard';

export const formatNavn = (navn: Navn) =>
  `${navn?.fornavn} ${navn?.mellomnavn ? `${navn?.mellomnavn} ` : ''}${navn?.etternavn}`;
