import { Periode } from '../types/Soknad';

export const isNonEmptyPeriode = (periode?: Periode) =>
  periode?.tilDato?.value && periode?.fraDato?.value;
