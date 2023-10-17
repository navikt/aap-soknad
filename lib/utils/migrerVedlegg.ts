/**
 *
 * Vi må migrere alle requiredVedlegg til å matche key i SoknadVedlegg.
 * Dette gjelder for avbruttStudie og barn-uuid
 * slik at det matcher nøkklene i Vedlegg
 *
 */
import { RequiredVedlegg } from '../../types/SoknadContext';

export function migrerVedlegg(requiredVedlegg: RequiredVedlegg[]): RequiredVedlegg[] {
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
