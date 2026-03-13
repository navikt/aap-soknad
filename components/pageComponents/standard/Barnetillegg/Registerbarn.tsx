'use client';
import * as classes from './Barnetillegg.module.css';
import { BodyShort, Label } from '@navikt/ds-react';
import React from 'react';
import { useTranslations } from 'next-intl';
import { formatDate } from 'utils/date';
import { Barn } from 'app/api/oppslag/barn/route';

interface Props {
  barn: Barn;
}

const Registerbarn = ({ barn }: Props) => {
  const t = useTranslations();

  return (
    <li>
      <article className={classes.barneKort}>
        <BodyShort>
          <Label>{t('søknad.barnetillegg.registrerteBarn.navn')}: </Label>
          {barn?.navn}
        </BodyShort>
        <BodyShort>
          <Label>
            {t('søknad.barnetillegg.registrerteBarn.fødselsdato')}:{' '}
          </Label>
          {formatDate(barn?.fødselsdato)}
        </BodyShort>
      </article>
    </li>
  );
};

export { Registerbarn };
