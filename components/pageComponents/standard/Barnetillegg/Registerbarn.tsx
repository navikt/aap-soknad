import * as classes from './Barnetillegg.module.css';
import { BodyShort, Label, Radio, RadioGroup, ReadMore } from '@navikt/ds-react';
import { formatNavn } from '../../../../utils/StringFormatters';
import { formatDate } from '../../../../utils/date';
import { JaEllerNei } from '../../../../types/Generic';
import React from 'react';
import { GRUNNBELØP } from './Barnetillegg';
import { Barn } from 'types/Soknad';
import { useIntl } from 'react-intl';

interface RegisterbarnProps {
  barn: Barn;
  index: number;
  findError: (path: string) => string | undefined;
  clearErrors: () => void;
  updateRegisterbarn: (updatedBarn: Barn, value: any) => void;
}

const Registerbarn = ({
  barn,
  index,
  findError,
  clearErrors,
  updateRegisterbarn,
}: RegisterbarnProps) => {
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
        <RadioGroup
          legend={formatMessage(
            { id: 'søknad.barnetillegg.registrerteBarn.harInntekt.label' },
            {
              grunnbeløp: GRUNNBELØP,
            }
          )}
          name={`barn[${index}].harInntekt`}
          id={`barn[${index}].harInntekt`}
          error={findError(`barn[${index}].harInntekt`)}
          value={barn.harInntekt || ''}
          onChange={(value) => {
            clearErrors();
            updateRegisterbarn(barn, value);
          }}
        >
          <ReadMore
            header={formatMessage({
              id: 'søknad.barnetillegg.registrerteBarn.harInntekt.readMore.title',
            })}
          >
            {formatMessage(
              { id: 'søknad.barnetillegg.registrerteBarn.harInntekt.readMore.text' },
              {
                grunnbeløp: GRUNNBELØP,
              }
            )}
          </ReadMore>
          <Radio value={JaEllerNei.JA}>
            <BodyShort>
              {formatMessage({ id: `answerOptions.jaEllerNei.${JaEllerNei.JA}` })}
            </BodyShort>
          </Radio>
          <Radio value={JaEllerNei.NEI}>
            <BodyShort>
              {formatMessage({ id: `answerOptions.jaEllerNei.${JaEllerNei.NEI}` })}
            </BodyShort>
          </Radio>
        </RadioGroup>
      </article>
    </li>
  );
};

export { Registerbarn };
