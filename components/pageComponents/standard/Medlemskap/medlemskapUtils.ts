import { JaEllerNei } from 'types/Generic';

export const shouldShowArbeidetUtenforNorgeSiste5År = (boddINorge?: JaEllerNei | null) => {
  return boddINorge === JaEllerNei.JA;
};

export const shouldShowArbeidetSammenhengendeINorgeSiste5År = (boddINorge?: JaEllerNei | null) => {
  return boddINorge === JaEllerNei.NEI;
};

export const shouldShowITilleggArbeidetUtenforNorgeSiste5År = (
  harArbeidetINorgeSiste5År?: JaEllerNei
) => {
  return harArbeidetINorgeSiste5År === JaEllerNei.JA;
};

export const shouldShowPeriodevelger = (
  arbeidUtenforNorge?: JaEllerNei,
  arbeidINorge?: JaEllerNei,
  iTilleggArbeidUtenforNorge?: JaEllerNei
) => {
  if (arbeidUtenforNorge === JaEllerNei.JA) {
    return true;
  }
  if (arbeidINorge === JaEllerNei.NEI) {
    return true;
  }
  if (iTilleggArbeidUtenforNorge === JaEllerNei.JA) {
    return true;
  }
  return false;
};
