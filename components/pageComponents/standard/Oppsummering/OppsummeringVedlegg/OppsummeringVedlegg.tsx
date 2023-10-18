import { Alert, Label } from '@navikt/ds-react';
import { Soknad } from 'types/Soknad';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { Relasjon } from '../../Barnetillegg/AddBarnModal';
import { getVedleggForManueltBarn } from '../../../../../utils/api';

interface Props {
  søknadState: GenericSoknadContextState<Soknad>;
}

export const OppsummeringVedlegg = ({ søknadState }: Props) => {
  const manglendeVedlegg = søknadState.requiredVedlegg.filter(
    (requiredVedlegg) => !requiredVedlegg.completed
  );

  const opplastedeVedlegg = søknadState.requiredVedlegg.filter(
    (requiredVedlegg) => requiredVedlegg.completed
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
                  {søknadState?.søknad?.vedlegg?.[vedlegg.type]?.map((vedlegg) => (
                    <li key={vedlegg.vedleggId}>{vedlegg?.name}</li>
                  ))}
                </ul>
              </div>
            );
          })}
          {søknadState?.søknad?.manuelleBarn?.map((barn) => {
            const label = søknadState?.requiredVedlegg?.find(
              (e) => e.type === barn.internId && e.completed
            )?.description;
            return (
              <div key={`barn-${barn.internId}`}>
                <Label>{label}</Label>
                <ul>
                  {getVedleggForManueltBarn(barn.internId, søknadState.søknad?.vedlegg)?.map(
                    (vedlegg) => (
                      <li key={vedlegg.vedleggId}>{vedlegg?.name}</li>
                    )
                  )}
                </ul>
              </div>
            );
          })}
        </>
      )}

      {søknadState?.søknad?.vedlegg?.ANNET && søknadState?.søknad?.vedlegg?.ANNET?.length > 0 && (
        <div>
          <Label>{'Annet:'}</Label>
          <ul>
            {søknadState?.søknad?.vedlegg?.ANNET?.map((vedlegg) => (
              <li key={vedlegg.vedleggId}>{vedlegg?.name}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
