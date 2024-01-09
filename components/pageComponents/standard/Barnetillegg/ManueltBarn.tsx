import * as classes from './Barnetillegg.module.css';
import { BodyShort, Button, Label } from '@navikt/ds-react';
import { formatNavn } from 'utils/StringFormatters';
import { formatDate } from 'utils/date';
import { Relasjon } from './AddBarnModal';
import { Delete } from '@navikt/ds-icons';
import React, { Dispatch } from 'react';
import { ManuelleBarn } from 'types/Soknad';
import { useIntl } from 'react-intl';
import { useSoknad } from 'hooks/SoknadHook';
import { removeRequiredVedlegg, updateSøknadData } from 'context/soknadcontext/actions';

interface BarnKortProps {
  barn: ManuelleBarn;
  setSelectedBarn: Dispatch<ManuelleBarn>;
  setShowModal: (vis: boolean) => void;
}
const ManueltBarn = ({ barn, setSelectedBarn, setShowModal }: BarnKortProps) => {
  const { formatMessage } = useIntl();
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
          <Label>{formatMessage({ id: 'søknad.barnetillegg.registrerteBarn.navn' })}: </Label>
          {formatNavn(barn?.navn)}
        </BodyShort>
        <BodyShort>
          <Label>{formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.fødselsdato' })}: </Label>

          {formatDate(barn?.fødseldato)}
        </BodyShort>
        {barn?.relasjon === Relasjon.FORELDER && (
          <BodyShort>
            {formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.erForelder' })}
          </BodyShort>
        )}
        {barn?.relasjon === Relasjon.FOSTERFORELDER && (
          <BodyShort>
            {formatMessage({
              id: 'søknad.barnetillegg.manuelleBarn.erFosterforelder',
            })}
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
            {formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.redigerBarn' })}
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
            {formatMessage({ id: 'søknad.barnetillegg.manuelleBarn.slettBarn' })}
          </Button>
        </div>
      </article>
    </li>
  );
};

export { ManueltBarn };
