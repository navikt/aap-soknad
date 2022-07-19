import { PageHeader } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { hentSoknadState, updateSøknadData } from '../../src/context/soknadContextCommon';

import {
  SoknadContextProviderUtland,
  useSoknadContextUtland,
} from '../../src/context/soknadContextUtland';
import {
  useStepWizard,
  setStepList,
  completeAndGoToNextStep,
  goToPreviousStep,
} from '../../src/context/stepWizardContextV2';
import { useFeatureToggleIntl } from '../../src/hooks/useFeatureToggleIntl';
import { SøknadType } from '../../src/types/SoknadContext';
import SoknadUtland from '../../src/types/SoknadUtland';
import { useDebounceLagreSoknad } from '../../src/hooks/useDebounceLagreSoknad';
import { fetchPOST } from '../../src/api/fetch';
import { defaultStepList } from '../../src/pages/utland/Utland';
import { StepWizard } from '../../src/components/StepWizard';
import { formatDate } from '../../src/utils/date';
import {
  StepSelectCountry,
  StepSelectTravelPeriod,
  StepSummary,
} from '../../src/pages/utland/Steps';

const Steps = () => {
  const router = useRouter();

  const { step } = router.query;

  console.log('router.query', step);

  const { søknadState, søknadDispatch } = useSoknadContextUtland();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();

  const debouncedLagre = useDebounceLagreSoknad();
  const { formatMessage } = useFeatureToggleIntl();

  useEffect(() => {
    const getSoknadState = async () => {
      const cachedState = await hentSoknadState(søknadDispatch, SøknadType.UTLAND);
      if (cachedState?.lagretStepList && cachedState?.lagretStepList?.length > 0) {
        setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      } else {
        setStepList([...defaultStepList], stepWizardDispatch);
      }
    };
    getSoknadState();
  }, []);

  useEffect(() => {
    if (søknadState?.søknad && Object.keys(søknadState?.søknad)?.length > 0) {
      debouncedLagre(søknadState, stepList, {});
    }
  }, [currentStep, stepList]);

  const myHandleSubmit = async () => {
    const postResponse = await postSøknad(søknadState?.søknad);
    if (!postResponse.ok) {
      console.error('noe gikk galt med sletting av lagret søknad', postResponse.error);
    }
    router.push('kvittering');
  };
  const postSøknad = async (data?: SoknadUtland) =>
    fetchPOST('/aap/soknad-api/innsending/utland', {
      land: data?.land,
      periode: {
        fom: formatDate(data?.fraDato, 'yyyy-MM-dd'),
        tom: formatDate(data?.tilDato, 'yyyy-MM-dd'),
      },
    });
  const onPreviousStep = () => {
    goToPreviousStep(stepWizardDispatch);
  };

  return (
    <>
      <header>
        <PageHeader align="center">{formatMessage('utland.title')}</PageHeader>
      </header>
      <StepWizard>
        {step === '1' && (
          <StepSelectCountry
            onBackClick={() => router.push('/utland')}
            onNext={(data: any) => {
              updateSøknadData(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('2');
            }}
          />
        )}
        {step === '2' && (
          <StepSelectTravelPeriod
            onBackClick={() => router.push('1')}
            onNext={(data: any) => {
              updateSøknadData(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('3');
            }}
          />
        )}
        {step === '3' && (
          <StepSummary
            onBackClick={() => router.push('2')}
            onSubmitSoknad={myHandleSubmit}
            data={søknadState?.søknad}
            onNext={(data: any) => {
              updateSøknadData(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              myHandleSubmit();
            }}
          />
        )}
      </StepWizard>
    </>
  );
};

const StepsWithContextProvider = () => (
  <SoknadContextProviderUtland>
    <Steps />
  </SoknadContextProviderUtland>
);

export default StepsWithContextProvider;
