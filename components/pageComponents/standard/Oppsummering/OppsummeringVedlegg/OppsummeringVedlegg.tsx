import { Alert, Label } from '@navikt/ds-react';
import { useMemo } from 'react';
import { Soknad, SoknadVedlegg } from 'types/Soknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { Relasjon } from '../../Barnetillegg/AddBarnModal';

interface Props {
  søknadState: GenericSoknadContextState<Soknad>;
}

export const OppsummeringVedlegg = ({ søknadState }: Props) => {
  const manglendeVedlegg = useMemo(
    () => søknadState.requiredVedlegg.filter((requiredVedlegg) => !requiredVedlegg.completed),
    [søknadState]
  );

  const opplastedeVedlegg = useMemo(
    () => søknadState.requiredVedlegg.filter((requiredVedlegg) => requiredVedlegg.completed),
    [søknadState]
  );

  return (
    <>
      {manglendeVedlegg.length > 0 && (
        <div>
          <Label>Dokumenter du må legge ved søknaden eller ettersende</Label>
          <ul>
            {manglendeVedlegg.map((manglendeVedlegg, index) => (
              <li key={`${manglendeVedlegg.type}-${index}`}>{manglendeVedlegg.description}</li>
            ))}
          </ul>
          <Alert variant="info">
            Du kan ettersende dette innen 14 dager per post eller digitalt. Du kan også levere dette
            på ditt lokale NAV kontor
          </Alert>
        </div>
      )}

      {opplastedeVedlegg.length > 0 && (
        <>
          <Label>Dokumenter du har lagt ved søknaden</Label>
          {opplastedeVedlegg?.map((vedlegg) => {
            if (
              vedlegg?.filterType === Relasjon.FORELDER ||
              vedlegg?.filterType === Relasjon.FOSTERFORELDER
            )
              return <></>;
            return (
              <div key={`opplastedevedlegg-${vedlegg.type}`}>
                <Label>{vedlegg?.description}</Label>
                <ul>
                  {søknadState?.søknad?.vedlegg?.[vedlegg.type as keyof SoknadVedlegg]?.map(
                    (vedleggFile) => (
                      <li key={vedleggFile.vedleggId}>{vedleggFile?.name}</li>
                    )
                  )}
                </ul>
              </div>
            );
          })}
          {søknadState?.søknad?.manuelleBarn?.map((barn) => {
            const label = søknadState?.requiredVedlegg?.find(
              (e) => e.type === `barn-${barn.internId}` && e.completed
            )?.description;
            return (
              <div key={`barn-${barn.internId}`}>
                <Label>{label}</Label>
                <ul>
                  {barn?.vedlegg?.map((vedlegg) => (
                    <li key={vedlegg?.vedleggId}>{vedlegg?.name}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </>
      )}

      {søknadState?.søknad?.vedlegg?.annet && søknadState?.søknad?.vedlegg?.annet?.length > 0 && (
        <div>
          <Label>{'Annet:'}</Label>
          <ul>
            {søknadState?.søknad?.vedlegg?.annet?.map((vedleggFile) => (
              <li key={vedleggFile.vedleggId}>{vedleggFile?.name}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
