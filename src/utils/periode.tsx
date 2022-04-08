import { Periode } from '../types/SoknadStandard';

export const isNonEmptyPeriode = (periode?: Periode) =>
  periode?.tilDato?.value && periode?.fraDato?.value;
