import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';
import { Barn } from 'types/Soknad';
import { formatDate } from 'utils/date';
import * as classes from './OppsummeringBarn.module.css';

type OppsummeringBarnProps = {
  barn: Barn;
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
