import { BodyShort, Heading } from '@navikt/ds-react';
import React from 'react';
import { Behandler } from 'types/Soknad';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { formatTelefonnummer } from 'utils/StringFormatters';

type Props = {
  behandler: Behandler;
};

const OppsummeringBehandler = ({ behandler }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  return (
    <article className={''}>
      <Heading size={'small'} level={'3'}>
        {formatMessage('søknad.oppsummering.helseopplysninger.behandler')}
      </Heading>
      <BodyShort>{`${behandler?.firstname} ${behandler?.lastname}`}</BodyShort>
      {behandler?.legekontor && <BodyShort>{behandler?.legekontor}</BodyShort>}
      {behandler?.gateadresse && (
        <BodyShort>{`${behandler?.gateadresse}, ${behandler?.postnummer} ${behandler?.poststed}`}</BodyShort>
      )}
      {behandler?.telefon && (
        <BodyShort>{`${formatMessage(
          'søknad.helseopplysninger.dineBehandlere.telefon'
        )}: ${formatTelefonnummer(behandler?.telefon)}`}</BodyShort>
      )}
    </article>
  );
};
export default OppsummeringBehandler;
