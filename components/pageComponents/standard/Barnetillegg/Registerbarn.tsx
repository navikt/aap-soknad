import * as classes from './Barnetillegg.module.css';
import { BodyShort, Label } from '@navikt/ds-react';
import { formatNavn } from 'utils/StringFormatters';
import { formatDate } from 'utils/date';
import React from 'react';
import { Barn } from 'types/Soknad';
import { useIntl } from 'react-intl';

interface Props {
  barn: Barn;
}

const Registerbarn = ({ barn }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <li key={barn.fnr}>
      <article className={classes.barneKort}>
        <BodyShort>
          <Label>{formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.navn' })}: </Label>
          {formatNavn(barn?.navn)}
        </BodyShort>
        <BodyShort>
          <Label>
            {formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.fødselsdato' })}:{' '}
          </Label>
          {formatDate(barn?.fødseldato)}
        </BodyShort>
      </article>
    </li>
  );
};

export { Registerbarn };
