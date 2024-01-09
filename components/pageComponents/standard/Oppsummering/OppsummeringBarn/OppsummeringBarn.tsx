import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';
import { Barn, ManuelleBarn } from 'types/Soknad';
import { formatDate } from 'utils/date';
import { formatNavn } from 'utils/StringFormatters';
import * as classes from './OppsummeringBarn.module.css';

type OppsummeringBarnProps = {
  barn: Barn | ManuelleBarn;
};

const OppsummeringBarn = ({ barn }: OppsummeringBarnProps) => {
  return (
    <article className={classes?.oppsummeringBarn}>
      <Label>{'Navn'}</Label>
      <BodyShort>{formatNavn(barn?.navn)}</BodyShort>
      <Label>Fødselsdato</Label>
      <BodyShort>{formatDate(barn?.fødseldato)}</BodyShort>
      {barn?.relasjon && (
        <>
          <Label>Relasjon til barnet</Label>
          <BodyShort>{barn?.relasjon}</BodyShort>
        </>
      )}
    </article>
  );
};
export default OppsummeringBarn;
