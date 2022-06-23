import { FieldValues, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import React from 'react';
import TextAreaWrapper from '../../../components/input/TextAreaWrapper';
import { BodyShort, Heading } from '@navikt/ds-react';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';

const TILLEGGSOPPLYSNINGER = 'tilleggsopplysninger';
interface Props {
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}

const Tilleggsopplysninger = ({ onBackClick, søknad }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

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
      nextButtonText={formatMessage('navigation.next')}
      backButtonText={formatMessage('navigation.back')}
      cancelButtonText={formatMessage('navigation.cancel')}
      errors={errors}
    >
      <Heading size="large" level="2">
        {formatMessage('søknad.tilleggsopplysninger.title')}
      </Heading>
      <LucaGuidePanel>
        <BodyShort>{formatMessage(`søknad.tilleggsopplysninger.guide.text`)}</BodyShort>
      </LucaGuidePanel>
      <TextAreaWrapper
        name={`${TILLEGGSOPPLYSNINGER}`}
        label={formatMessage(`søknad.tilleggsopplysninger.tilleggsopplysninger.label`)}
        control={control}
        error={errors?.[TILLEGGSOPPLYSNINGER]?.message}
        maxLength={4000}
      />
    </SoknadFormWrapper>
  );
};
export default Tilleggsopplysninger;
