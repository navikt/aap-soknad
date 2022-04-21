import Soknad from '../../../types/Soknad';
import { GetText } from '../../../hooks/useTexts';
import RadioGroupWrapper from '../../../components/input/RadioGroupWrapper';
import { BodyLong, BodyShort, GuidePanel, Heading, Radio } from '@navikt/ds-react';
import { JaEllerNei } from '../../../types/Generic';
import React from 'react';
import * as yup from 'yup';
import { updateSøknadData, useSoknadContext } from '../../../context/soknadContext';
import { completeAndGoToNextStep, useStepWizard } from '../../../context/stepWizardContextV2';
import { FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SoknadFormWrapper from '../../../components/SoknadFormWrapper/SoknadFormWrapper';

const STUDENT = 'student';
const ER_STUDENT = 'erStudent';
interface Props {
  getText: GetText;
  søknad?: Soknad;
  onBackClick: () => void;
  onCancelClick: () => void;
}

const Student = ({ getText, onBackClick, onCancelClick, søknad }: Props) => {
  const schema = yup.object().shape({
    [STUDENT]: yup
      .string()
      .required(getText('form.student.required'))
      .oneOf([JaEllerNei.JA, JaEllerNei.NEI], getText('form.student.required'))
      .typeError(getText('form.student.required')),
  });
  const { søknadDispatch } = useSoknadContext();
  const { stepWizardDispatch } = useStepWizard();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      [STUDENT]: søknad?.student,
    },
  });
  return (
    <SoknadFormWrapper
      onNext={handleSubmit((data) => {
        updateSøknadData(søknadDispatch, data);
        completeAndGoToNextStep(stepWizardDispatch);
      })}
      onBack={() => onBackClick()}
      onCancel={() => onCancelClick()}
      nextButtonText={'Neste steg'}
      backButtonText={'Forrige steg'}
      cancelButtonText={'Avbryt søknad'}
      errors={errors}
    >
      <Heading size="large" level="2">
        {getText('steps.student.title')}
      </Heading>
      <GuidePanel>
        <BodyLong>{getText('steps.student.guide1')}</BodyLong>
        <BodyLong>{getText('steps.student.guide2')}</BodyLong>
      </GuidePanel>
      <RadioGroupWrapper
        name={`${STUDENT}.${ER_STUDENT}`}
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
    </SoknadFormWrapper>
  );
};
export default Student;
