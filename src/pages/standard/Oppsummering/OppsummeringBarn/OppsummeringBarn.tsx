import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';
import { Barn } from '../../../../types/Soknad';
import { formatNavn } from '../../../../utils/StringFormatters';
import * as classes from './OppsummeringBarn.module.css';

type OppsummeringBarnProps = {
  barn: Barn;
};

const OppsummeringBarn = ({ barn }: OppsummeringBarnProps) => {
  return (
    <article className={classes?.oppsummeringBarn}>
      <Label>{'Navn'}</Label>
      <BodyShort>{formatNavn(barn?.navn)}</BodyShort>
      <Label>{'Har inntekt over 1G:'}</Label>
      <BodyShort>{barn?.harInntekt}</BodyShort>
    </article>
  );
};
export default OppsummeringBarn;
