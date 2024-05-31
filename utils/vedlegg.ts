import { Soknad } from 'types/Soknad';
import { AttachmentType } from 'types/SoknadContext';

export interface Fil {
  id: string;
  tittel: string;
}
export const søknadVedleggStateTilFilArray = (søknad: Soknad) => {
  const filer: Fil[] = Object.keys(søknad.vedlegg ?? {})
    .map((key) => {
      const vedleggArray = søknad?.vedlegg?.[key];
      const filerArray: Fil[] =
        vedleggArray?.map((vedlegg) => {
          return {
            id: vedlegg.vedleggId,
            tittel: mapVedleggTypeTilVedleggTekst(key),
          };
        }) ?? [];

      return filerArray;
    })
    .flat();
  return filer;
};

export const søknadVedleggStateTilFilIdString = (søknad: Soknad) => {
  return søknadVedleggStateTilFilArray(søknad)
    .map((fil) => fil.id)
    .join(',');
};
function mapVedleggTypeTilVedleggTekst(vedleggType: AttachmentType): string {
  switch (vedleggType) {
    case 'LØNN_OG_ANDRE_GODER':
      return 'Dokumentasjon om lønn og andre goder';
    case 'OMSORGSSTØNAD':
      return 'Dokumentasjon om omsorgsstønad';
    case 'UTLANDSSTØNAD':
      return 'Dokumentasjon om utenlandsstønad';
    case 'SYKESTIPEND':
      return 'Dokumentasjon om sykestipend';
    case 'LÅN':
      return 'Dokumentasjon om lån';
    case 'AVBRUTT_STUDIE':
      return 'Dokumentasjon om avbrutt studie';
    case 'ANNET':
      return 'Annen dokumentasjon';
    default:
      return 'Dokumentasjon om barn eller fosterbarn';
  }
}
