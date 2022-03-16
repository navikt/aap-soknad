import { Control, FieldErrors } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { GetText } from '../../hooks/useTexts';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import { BodyShort, Radio } from '@navikt/ds-react';
import { JaEllerNei } from '../../types/Generic';
import React, { useEffect } from 'react';

const STUDENT = 'student';
const ER_STUDENT = 'erStudent';
interface StudentProps {
  control: Control<SoknadStandard>;
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
  );
};
export default Student;
