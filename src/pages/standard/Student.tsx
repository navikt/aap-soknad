import { Control, FieldErrors } from 'react-hook-form';
import Soknad from '../../types/Soknad';
import { GetText } from '../../hooks/useTexts';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import { BodyLong, BodyShort, GuidePanel, Heading, Radio } from '@navikt/ds-react';
import { JaEllerNei } from '../../types/Generic';
import React, { useEffect } from 'react';

const STUDENT = 'student';
const ER_STUDENT = 'erStudent';
interface StudentProps {
  control: Control<Soknad>;
  getText: GetText;
  errors: FieldErrors;
  setValue: any;
}

const Student = ({ getText, errors, control, setValue }: StudentProps) => {
  useEffect(
    () => setValue(`${STUDENT}.${ER_STUDENT}.label`, getText(`form.${STUDENT}.legend`)),
    [getText]
  );
  return (
    <>
      <Heading size="large" level="2">
        {getText('steps.student.title')}
      </Heading>
      <GuidePanel>
        <BodyLong>{getText('steps.student.guide1')}</BodyLong>
        <BodyLong>{getText('steps.student.guide2')}</BodyLong>
      </GuidePanel>
      <RadioGroupWrapper
        name={`${STUDENT}.${ER_STUDENT}.value`}
        legend={getText(`form.${STUDENT}.legend`)}
        control={control}
        error={errors?.[STUDENT]?.[ER_STUDENT]?.message}
      >
        <Radio value={JaEllerNei.JA}>
          <BodyShort>Ja</BodyShort>
        </Radio>
        <Radio value={JaEllerNei.NEI}>
          <BodyShort>Nei</BodyShort>
        </Radio>
      </RadioGroupWrapper>
    </>
  );
};
export default Student;
