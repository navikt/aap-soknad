import * as classes from './Barnetillegg.module.css';
import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';
import { useIntl } from 'react-intl';
import { formatDate } from 'utils/date';
import { Barn } from 'pages/api/oppslag/barn';

interface Props {
  barn: Barn;
}

const Registerbarn = ({ barn }: Props) => {
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
