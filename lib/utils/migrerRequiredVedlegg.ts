/**
 *
 * Vi må migrere alle requiredVedlegg til å matche key i SoknadVedlegg.
 * Dette gjelder for avbruttStudie og barn-uuid
 * slik at det matcher nøkklene i Vedlegg
 *
 */
import { RequiredVedlegg } from '../../types/SoknadContext';
import { SoknadVedlegg } from '../../types/Soknad';

export function migrerRequiredVedlegg(requiredVedlegg: RequiredVedlegg[]): RequiredVedlegg[] {
  return requiredVedlegg.map((vedlegg) => {
    const type = vedlegg.type as string;
    if (type === 'avbruttStudie') {
      return { ...vedlegg, type: 'AVBRUTT_STUDIE' };
    } else if (type.includes('barn-')) {
      const nyType = type.replace('barn-', '');
      return { ...vedlegg, type: nyType };
    }
    return vedlegg;
  });
}

export function migrerVedlegg(vedlegg?: SoknadVedlegg): SoknadVedlegg | undefined {
  if (vedlegg) {
    let nyeVedlegg = { ...vedlegg, AVBRUTT_STUDIE: vedlegg.avbruttStudie };
    // @ts-ignore
    delete nyeVedlegg.avbruttStudie;
    return nyeVedlegg;
  }
}
