import { BodyShort, Heading } from '@navikt/ds-react';
import React from 'react';
import { Behandler } from '../../../../types/Soknad';
import { useFeatureToggleIntl } from '../../../../hooks/useFeatureToggleIntl';

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
      <BodyShort>{behandler?.legekontor}</BodyShort>
      <BodyShort>{`${behandler?.gateadresse}, ${behandler?.postnummer} ${behandler?.poststed}`}</BodyShort>
      <BodyShort>{`${formatMessage('søknad.helseopplysninger.dineBehandlere.telefon')}: ${
        behandler?.telefon
      }`}</BodyShort>
    </article>
  );
};
export default OppsummeringBehandler;
