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
      <Label>{barn?.erForsørger?.label}</Label>
      <BodyShort>{barn?.erForsørger?.value}</BodyShort>
      <Label>{barn?.adoptertEllerFosterBarn?.label}</Label>
      <BodyShort>{barn?.adoptertEllerFosterBarn?.value}</BodyShort>
    </article>
  );
};
export default OppsummeringBarn;
