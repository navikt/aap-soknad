import { Label, BodyShort, Alert } from '@navikt/ds-react';
import { useMemo } from 'react';
import { Soknad } from 'types/Soknad';
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
        <>
          <Label>Dokumenter du må legge ved søknaden eller ettersende</Label>
          <ul>
            {manglendeVedlegg.map((manglendeVedlegg) => (
              <li key={manglendeVedlegg.type}>{manglendeVedlegg.description}</li>
            ))}
          </ul>
          <Alert variant="info">
            Du kan ettersende dette innen 14 dager per post eller digitalt. Du kan også levere dette
            på ditt lokale NAV kontor
          </Alert>
        </>
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
              <>
                <Label>{vedlegg?.description}</Label>
                {søknadState?.søknad?.vedlegg?.[vedlegg.type]?.map((vedleggFile) => (
                  <BodyShort key={vedleggFile.name}>{vedleggFile?.name}</BodyShort>
                ))}
              </>
            );
          })}
          {søknadState?.søknad?.manuelleBarn?.map((barn, i) => {
            const label = søknadState?.requiredVedlegg?.find(
              (e) => e.type === `barn-${barn.internId}` && e.completed
            )?.description;
            return (
              <div key={i}>
                <Label>{label}</Label>
                {barn?.vedlegg?.map((vedlegg, j) => (
                  <BodyShort key={j}>{vedlegg?.name}</BodyShort>
                ))}
              </div>
            );
          })}
        </>
      )}

      {søknadState?.søknad?.vedlegg?.annet && søknadState?.søknad?.vedlegg?.annet?.length > 0 && (
        <>
          <Label>{'Annet:'}</Label>
          {søknadState?.søknad?.vedlegg?.annet?.map((vedleggFile) => (
            <BodyShort key={vedleggFile.vedleggId}>{vedleggFile?.name}</BodyShort>
          ))}
        </>
      )}
    </>
  );
};
