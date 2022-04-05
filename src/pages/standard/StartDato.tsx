import { Control, FieldErrors } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { GetText } from '../../hooks/useTexts';
import React, { useEffect } from 'react';
import DatoVelgerWrapper from '../../components/input/DatoVelgerWrapper';
import { BodyLong, GuidePanel, Heading, ReadMore } from '@navikt/ds-react';

const STARTDATO = 'startDato';
interface Props {
  control: Control<SoknadStandard>;
  getText: GetText;
  errors: FieldErrors;
  setValue: any;
}

const StartDato = ({ getText, errors, control, setValue }: Props) => {
  useEffect(() => setValue(`${STARTDATO}.label`, getText(`form.${STARTDATO}.label`)), [getText]);
  return (
    <>
      <Heading size="large" level="2">
        {getText('steps.startDato.title')}
      </Heading>
      <GuidePanel>
        {getText('steps.startDato.guide')}
        <ReadMore header={getText('steps.startDato.guideReadMore.heading')} type={'button'}>
          <BodyLong>{getText('steps.startDato.guideReadMore.text')}</BodyLong>
        </ReadMore>
      </GuidePanel>
      <DatoVelgerWrapper
        name="startDato.value"
        label={getText(`form.${STARTDATO}.label`)}
        control={control}
        error={errors.startDato?.value?.message}
      />
    </>
  );
};
export default StartDato;
