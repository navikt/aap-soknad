import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';
import { formatDate } from 'utils/date';
import * as classes from './OppsummeringBarn.module.css';
import { BarnOppslag } from 'pages/api/oppslag/barn';

type OppsummeringBarnProps = {
  barn: BarnOppslag;
};

export const OppsummeringBarn = ({ barn }: OppsummeringBarnProps) => {
  return (
    <article className={classes?.oppsummeringBarn}>
      <Label>{'Navn'}</Label>
      <BodyShort>{barn?.navn}</BodyShort>
      <Label>Fødselsdato</Label>
      <BodyShort>{formatDate(barn?.fødselsdato)}</BodyShort>
    </article>
  );
};
