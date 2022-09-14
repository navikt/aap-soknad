import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { Soknad } from 'types/Soknad';
import React, { useEffect } from 'react';
import TextAreaWrapper from 'components/input/TextAreaWrapper';
import { BodyShort, Heading } from '@navikt/ds-react';
import { useStepWizard } from 'context/stepWizardContextV2';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import SoknadFormWrapper from 'components/SoknadFormWrapper/SoknadFormWrapper';
import { LucaGuidePanel } from 'components/LucaGuidePanel';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { slettLagretSoknadState, updateSøknadData } from 'context/soknadContextCommon';
import { useSoknadContextStandard } from 'context/soknadContextStandard';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { GenericSoknadContextState } from 'types/SoknadContext';

const TILLEGGSOPPLYSNINGER = 'tilleggsopplysninger';
interface Props {
  onBackClick: () => void;
  onNext: (data: any) => void;
  defaultValues?: GenericSoknadContextState<Soknad>;
}

const Tilleggsopplysninger = ({ onBackClick, onNext, defaultValues }: Props) => {
  const { formatMessage } = useFeatureToggleIntl();

  const schema = yup.object().shape({});
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { stepList } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [TILLEGGSOPPLYSNINGER]: defaultValues?.søknad?.tilleggsopplysninger,
    },
  });
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const allFields = useWatch({ control });
  useEffect(() => {
    debouncedLagre(søknadState, stepList, allFields);
  }, [allFields]);
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        onNext(data);
      })}
      onBack={() => {
        updateSøknadData<Soknad>(søknadDispatch, { ...søknadState.søknad });
        onBackClick();
      }}
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
