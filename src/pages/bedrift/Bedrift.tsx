import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button, Loader, PageHeader } from '@navikt/ds-react';
import { StepWizard, Step } from '../../components/StepWizard';
import useTexts from '../../hooks/useTexts';
import { Introduction, PersonligInfo, TypeStoette } from './BedriftSteps';
import { getBedriftSchema } from '../../schemas/bedrift';
import { FormErrorSummary } from '../../components/schema/FormErrorSummary';
import { Utdanning } from './steps/Utdanning';
import { Praksis } from './steps/Praksis';
import { Etablererstipend } from './steps/Etablererstipend';

import './Bedrift.less';
import * as tekster from './tekster';
import {
  completeAndGoToNextStep,
  goToPreviousStep,
  useStepWizard,
} from '../../context/stepWizardContextV2';

enum StepName {
  INTRODUCTION = 'INTRODUCTION',
  TYPE_STOETTE = 'TYPE_STOETTE',
  PERSONLIG = 'PERSONLIG',
  UTDANNING = 'UTDANNING',
  PRAKSIS = 'PRAKSIS',
  SOEKT_OM_ETABLERER_STIPEND = 'SOEKT_OM_ETABLERER_STIPEND',
  SUMMARY = 'SUMMARY',
  RECEIPT = 'RECEIPT',
}

type FormData = object | undefined;

const getButtonText = (name: string) => {
  switch (name) {
    case StepName.INTRODUCTION:
      return 'Fortsett til søknaden';
    case StepName.SUMMARY:
      return 'Send søknaden';
    default:
      return 'Neste';
  }
};

const Bedrift = (): JSX.Element => {
  const { currentStep, currentStepIndex, stepWizardDispatch } = useStepWizard();
  const [isLoading] = useState<boolean>(false);
  const { getText } = useTexts(tekster);
  const bedriftSchema = getBedriftSchema(getText);
  const currentSchema = bedriftSchema[currentStepIndex];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(currentSchema),
    mode: 'onBlur',
  });

  const onSubmitClick = async (data: FormData) => {
    if (currentStep?.name === StepName.SUMMARY) {
      console.log(data);
    } else {
      completeAndGoToNextStep(stepWizardDispatch);
    }
  };

  return (
    <>
      <PageHeader align="center">{getText('pageTitle')}</PageHeader>
      <StepWizard>
        <Step order={1} name={StepName.INTRODUCTION}>
          <Introduction getText={getText} />
        </Step>
        <form
          onSubmit={handleSubmit(async (data) => onSubmitClick(data))}
          className="soknad-bedrift-form"
        >
          <Step order={2} name={StepName.TYPE_STOETTE}>
            <TypeStoette getText={getText} errors={errors} register={register} />
          </Step>
          <Step order={3} name={StepName.PERSONLIG}>
            <PersonligInfo getText={getText} errors={errors} register={register} />
          </Step>
          <Step order={4} name={StepName.UTDANNING}>
            <Utdanning
              getText={getText}
              errors={errors.utdanning}
              register={register}
              control={control}
            />
          </Step>
          <Step order={5} name={StepName.PRAKSIS}>
            <Praksis
              getText={getText}
              register={register}
              errors={errors.praksis}
              control={control}
            />
          </Step>
          <Step order={6} name={StepName.SOEKT_OM_ETABLERER_STIPEND}>
            <Etablererstipend
              getText={getText}
              register={register}
              errors={errors.etablererstipend}
              getValues={getValues}
            />
          </Step>
          <FormErrorSummary errors={errors} />
          <Button variant="primary" type="submit" disabled={isLoading}>
            {getButtonText(currentStep?.name)}
            {isLoading && <Loader />}
          </Button>
        </form>
        {![StepName.INTRODUCTION, StepName.RECEIPT].includes(currentStep.name as StepName) && (
          <Button variant="tertiary" onClick={() => goToPreviousStep(stepWizardDispatch)}>
            Tilbake
          </Button>
        )}
      </StepWizard>
    </>
  );
};

export { Bedrift };
