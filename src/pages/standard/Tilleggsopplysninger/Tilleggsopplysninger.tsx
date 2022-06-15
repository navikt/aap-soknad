import { FieldValues, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import { GetText } from '../../../hooks/useTexts';
import React from 'react';
import TextAreaWrapper from '../../../components/input/TextAreaWrapper';
import { BodyShort, Heading } from '@navikt/ds-react';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';

const TILLEGGSOPPLYSNINGER = 'tilleggsopplysninger';
interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}

const Tilleggsopplysninger = ({ getText, onBackClick, søknad }: Props) => {
  const schema = yup.object().shape({});
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [TILLEGGSOPPLYSNINGER]: søknad?.tilleggsopplysninger,
    },
  });
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      nextButtonText={'Neste steg'}
      backButtonText={'Forrige steg'}
      cancelButtonText={'Avbryt søknad'}
      errors={errors}
    >
      <Heading size="large" level="2">
        {getText('steps.tilleggsopplysninger.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyShort>{getText(`steps.tilleggsopplysninger.guide`)}</BodyShort>
      </LucaGuidePanel>
      <TextAreaWrapper
        name={`${TILLEGGSOPPLYSNINGER}`}
        label={getText(`form.${TILLEGGSOPPLYSNINGER}.label`)}
        control={control}
        error={errors?.[TILLEGGSOPPLYSNINGER]?.message}
      />
    </SoknadFormWrapper>
  );
};
export default Tilleggsopplysninger;
