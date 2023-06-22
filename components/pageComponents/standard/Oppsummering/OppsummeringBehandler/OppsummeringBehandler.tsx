import { BodyShort, Heading } from '@navikt/ds-react';
import React from 'react';
import { Behandler } from 'types/Soknad';
import { formatTelefonnummer } from 'utils/StringFormatters';
import { useIntl } from 'react-intl';

type Props = {
  behandler: Behandler;
};

const OppsummeringBehandler = ({ behandler }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <article className={''}>
      <Heading size={'small'} level={'3'}>
        {formatMessage({ id: 'søknad.oppsummering.helseopplysninger.behandler' })}
      </Heading>
      <BodyShort>{`${behandler?.firstname} ${behandler?.lastname}`}</BodyShort>
      {behandler?.legekontor && <BodyShort>{behandler?.legekontor}</BodyShort>}
      {behandler?.gateadresse && (
        <BodyShort>{`${behandler?.gateadresse}, ${behandler?.postnummer} ${behandler?.poststed}`}</BodyShort>
      )}
      {behandler?.telefon && (
        <BodyShort>{`${formatMessage({
          id: 'søknad.helseopplysninger.dineBehandlere.telefon',
        })}: ${formatTelefonnummer(behandler?.telefon)}`}</BodyShort>
      )}
    </article>
  );
};
export default OppsummeringBehandler;
