import * as classes from './Barnetillegg.module.css';
import { BodyShort, Label, Radio, RadioGroup, ReadMore } from '@navikt/ds-react';
import { formatNavn } from '../../../../utils/StringFormatters';
import { formatDate } from '../../../../utils/date';
import React from 'react';
import { useIntl } from 'react-intl';
import { BarnOppslag } from 'pages/api/oppslag/barn';

interface RegisterbarnProps {
  barn: BarnOppslag;
}

const Registerbarn = ({ barn }: RegisterbarnProps) => {
  const { formatMessage } = useIntl();
  return (
    <li>
      <article className={classes.barneKort}>
        <BodyShort>
          <Label>{formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.navn' })}: </Label>
          {barn?.navn}
        </BodyShort>
        <BodyShort>
          <Label>
            {formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.fødselsdato' })}:{' '}
          </Label>
          {formatDate(barn?.fødselsdato)}
        </BodyShort>
      </article>
    </li>
  );
};

export { Registerbarn };
