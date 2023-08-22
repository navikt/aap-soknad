import { JaEllerNei } from '../../../../types/Generic';
import { Medlemskap as MedlemskapType } from '../../../../types/Soknad';
import { ArbeidEllerBodd } from '../UtenlandsPeriodeVelger/UtenlandsPeriodeVelger';

export const validateArbeidINorge = (boddINorge?: JaEllerNei | null) =>
  boddINorge === JaEllerNei.NEI;

export const validateArbeidUtenforNorgeFørSykdom = (boddINorge?: JaEllerNei | null) =>
  boddINorge === JaEllerNei.JA;

export const validateOgsåArbeidetUtenforNorge = (
  boddINorge?: JaEllerNei | null,
  JobbINorge?: JaEllerNei
) => boddINorge === JaEllerNei.NEI && JobbINorge === JaEllerNei.JA;

export const validateUtenlandsPeriode = (medlemskap?: MedlemskapType) => {
  return (
    medlemskap?.arbeidetUtenforNorgeFørSykdom === JaEllerNei.JA ||
    medlemskap?.harArbeidetINorgeSiste5År === JaEllerNei.NEI ||
    medlemskap?.iTilleggArbeidUtenforNorge === JaEllerNei.JA
  );
};

export function utenlandsPeriodeArbeidEllerBodd(medlemskap?: MedlemskapType) {
  if (
    medlemskap?.harBoddINorgeSiste5År === JaEllerNei.NEI &&
    medlemskap?.harArbeidetINorgeSiste5År === JaEllerNei.NEI
  ) {
    return ArbeidEllerBodd.BODD;
  }
  return ArbeidEllerBodd.ARBEID;
}
