import { BodyShort, Heading } from '@navikt/ds-react';
import React from 'react';
import { Behandler } from '../../../../types/SoknadStandard';
import { GetText } from '../../../../hooks/useTexts';

type Props = {
  getText: GetText;
  behandler: Behandler;
};

const OppsummeringBehandler = ({ getText, behandler }: Props) => {
  return (
    <article className={''}>
      <Heading size={'small'} level={'3'}>
        {getText('steps.oppsummering.helseopplysninger.behandler')}
      </Heading>
      <BodyShort>{behandler?.name}</BodyShort>
      <BodyShort>{behandler?.legekontor}</BodyShort>
      <BodyShort>{`${behandler?.gateadresse}, ${behandler?.postnummer} ${behandler?.poststed}`}</BodyShort>
      <BodyShort>{`Telefon: ${behandler?.telefon}`}</BodyShort>
    </article>
  );
};
export default OppsummeringBehandler;
