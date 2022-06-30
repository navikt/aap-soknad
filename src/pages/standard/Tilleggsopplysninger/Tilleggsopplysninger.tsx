import { FieldValues, useForm } from 'react-hook-form';
import Soknad from '../../../types/Soknad';
import React, { useEffect } from 'react';
import TextAreaWrapper from '../../../components/input/TextAreaWrapper';
import { BodyShort, Heading } from '@navikt/ds-react';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';
import { LucaGuidePanel } from '../../../components/LucaGuidePanel';
import { useFeatureToggleIntl } from '../../../hooks/useFeatureToggleIntl';
import { slettLagretSoknadState, updateSøknadData } from '../../../context/soknadContextCommon';
import { useSoknadContextStandard } from '../../../context/soknadContextStandard';
import { useDebounceLagreSoknad } from '../../../hooks/useDebounceLagreSoknad';

const TILLEGGSOPPLYSNINGER = 'tilleggsopplysninger';
interface Props {
  onBackClick: () => void;
  onCancelClick: () => void;
}

const Tilleggsopplysninger = ({ onBackClick }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({});
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList, stepWizardDispatch } = useStepWizard();
  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [TILLEGGSOPPLYSNINGER]: søknadState?.søknad?.tilleggsopplysninger,
    },
  });
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = watch();
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData<Soknad>(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      onDelete={() => slettLagretSoknadState<Soknad>(søknadDispatch, søknadState)}
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
