'use client';
import * as classes from './Barnetillegg.module.css';
import { BodyShort, Button, Label } from '@navikt/ds-react';
import { formatNavn } from 'utils/StringFormatters';
import { formatDate } from 'utils/date';
import { Relasjon } from './AddBarnModal';
import { Delete } from '@navikt/ds-icons';
import React, { Dispatch } from 'react';
import { ManuelleBarn } from 'types/Soknad';
import { useTranslations } from 'next-intl';
import { useSoknad } from 'hooks/SoknadHook';
import { removeRequiredVedlegg, updateSøknadData } from 'context/soknadcontext/actions';

interface BarnKortProps {
  barn: ManuelleBarn;
  setSelectedBarn: Dispatch<ManuelleBarn>;
  setShowModal: (vis: boolean) => void;
}
const ManueltBarn = ({ barn, setSelectedBarn, setShowModal }: BarnKortProps) => {
  const t = useTranslations();
  const { søknadState, søknadDispatch } = useSoknad();

  const slettBarn = (barnId: string) => {
    updateSøknadData(søknadDispatch, {
      manuelleBarn: søknadState.søknad?.manuelleBarn?.filter((barn) => barnId !== barn.internId),
    });
    removeRequiredVedlegg(barnId, søknadDispatch);
  };

  return (
    <li key={barn?.internId}>
      <article className={classes.barneKort}>
        <BodyShort>
          <Label>{t('søknad.barnetillegg.registrerteBarn.navn')}: </Label>
          {formatNavn(barn?.navn)}
        </BodyShort>
        <BodyShort>
          <Label>{t('søknad.barnetillegg.manuelleBarn.fødselsdato')}: </Label>

          {formatDate(barn?.fødseldato)}
        </BodyShort>
        {barn?.relasjon === Relasjon.FORELDER && (
          <BodyShort>
            {t('søknad.barnetillegg.manuelleBarn.erForelder')}
          </BodyShort>
        )}
        {barn?.relasjon === Relasjon.FOSTERFORELDER && (
          <BodyShort>
            {t('søknad.barnetillegg.manuelleBarn.erFosterforelder')}
          </BodyShort>
        )}
        <div className={classes?.cardButtonWrapper}>
          <Button
            variant="tertiary"
            type="button"
            onClick={() => {
              setSelectedBarn(barn);
              setShowModal(true);
            }}
          >
            {t('søknad.barnetillegg.manuelleBarn.redigerBarn')}
          </Button>
          <Button
            variant="tertiary"
            type="button"
            icon={<Delete title={'Slett'} />}
            iconPosition={'left'}
            onClick={() => {
              slettBarn(barn.internId);
            }}
          >
            {t('søknad.barnetillegg.manuelleBarn.slettBarn')}
          </Button>
        </div>
      </article>
    </li>
  );
};

export { ManueltBarn };
