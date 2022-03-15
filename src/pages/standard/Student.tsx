import { Control, FieldErrors, UseFormProps } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { GetText } from '../../hooks/useTexts';
import RadioGroupWrapper from '../../components/input/RadioGroupWrapper';
import { BodyShort, Radio } from '@navikt/ds-react';
import { JaEllerNei } from '../../types/Generic';
import React from 'react';

interface StudentProps {
  control: Control<UseFormProps<SoknadStandard>>;
  getText: GetText;
  errors: FieldErrors;
}

const Student = ({ getText, errors, control }: StudentProps) => {
  return (
    <RadioGroupWrapper
      name={'erStudent'}
      legend={getText('form.student.legend')}
      control={control}
      error={errors?.erStudent?.message}
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
