import * as classes from './Barnetillegg.module.css';
import { BodyShort, Button, Label } from '@navikt/ds-react';
import { formatNavn } from '../../../../utils/StringFormatters';
import { formatDate } from '../../../../utils/date';
import { Relasjon } from './AddBarnModal';
import { JaEllerNei } from '../../../../types/Generic';
import { Delete } from '@navikt/ds-icons';
import React, { Dispatch } from 'react';
import { GRUNNBELØP } from './Barnetillegg';
import { ManuelleBarn } from '../../../../types/Soknad';
import { useIntl } from 'react-intl';

interface BarnKortProps {
  barn: ManuelleBarn;
  setSelectedBarn: Dispatch<ManuelleBarn>;
  slettBarn: (barnId?: string) => void;
  setShowModal: (vis: boolean) => void;
}
const ManueltBarn = ({ barn, setSelectedBarn, slettBarn, setShowModal }: BarnKortProps) => {
  const { formatMessage } = useIntl();
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
        {barn?.harInntekt === JaEllerNei.JA && (
          <BodyShort>
            {formatMessage(
              { id: 'søknad.barnetillegg.manuelleBarn.inntektOver1G' },
              {
                grunnbeløp: GRUNNBELØP,
              }
            )}
          </BodyShort>
        )}
        {barn?.harInntekt === JaEllerNei.NEI && (
          <BodyShort>
            {formatMessage(
              { id: 'søknad.barnetillegg.manuelleBarn.inntektIkkeOver1G' },
              {
                grunnbeløp: GRUNNBELØP,
              }
            )}
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
