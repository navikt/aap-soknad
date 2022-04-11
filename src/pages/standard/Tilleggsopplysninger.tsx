import { Control, FieldErrors } from 'react-hook-form';
import SoknadStandard from '../../types/SoknadStandard';
import { GetText } from '../../hooks/useTexts';
import React, { useEffect } from 'react';
import TextAreaWrapper from '../../components/input/TextAreaWrapper';
import { BodyShort, GuidePanel, Heading } from '@navikt/ds-react';

const TILLEGGSOPPLYSNINGER = 'tilleggsopplysninger';
interface TilleggsopplysningerProps {
  control: Control<SoknadStandard>;
  getText: GetText;
  errors: FieldErrors;
  setValue: any;
}

const Tilleggsopplysninger = ({
  getText,
  errors,
  control,
  setValue,
}: TilleggsopplysningerProps) => {
  useEffect(
    () => setValue(`${TILLEGGSOPPLYSNINGER}.label`, getText(`form.${TILLEGGSOPPLYSNINGER}.label`)),
    [getText]
  );
  return (
    <>
      <Heading size="large" level="2">
        {getText('steps.tilleggsopplysninger.title')}
      </Heading>
      <GuidePanel>
        <BodyShort>{getText(`steps.tilleggsopplysninger.guide`)}</BodyShort>
      </GuidePanel>
      <TextAreaWrapper
        name={`${TILLEGGSOPPLYSNINGER}.value`}
        label={getText(`form.${TILLEGGSOPPLYSNINGER}.label`)}
        control={control}
        error={errors?.[TILLEGGSOPPLYSNINGER]?.message}
      />
    </>
  );
};
export default Tilleggsopplysninger;
