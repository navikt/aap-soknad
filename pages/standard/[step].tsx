import { PageHeader } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { hentSoknadState, slettLagretSoknadState } from '../../src/context/soknadContextCommon';
import {
  useStepWizard,
  setStepList,
  completeAndGoToNextStep,
  goToPreviousStep,
  resetStepWizard,
} from '../../src/context/stepWizardContextV2';
import { useFeatureToggleIntl } from '../../src/hooks/useFeatureToggleIntl';
import { SøknadType } from '../../src/types/SoknadContext';
import { useDebounceLagreSoknad } from '../../src/hooks/useDebounceLagreSoknad';
import { StepWizard } from '../../src/components/StepWizard';
import {
  SoknadContextProviderStandard,
  useSoknadContextStandard,
  addBarnIfMissing,
} from '../../src/context/soknadContextStandard';
import { hentSokerOppslag, useSokerOppslag } from '../../src/context/sokerOppslagContext';
import { updateSøknadData } from '../../src/context/soknadContextCommon';
import Soknad from '../../src/types/Soknad';
import { SubmitHandler } from 'react-hook-form';
import { fetchPOST } from '../../src/api/fetch';
import { defaultStepList, mapSøknadToBackend, StepNames } from '../../src/pages/standard';
import StartDato from '../../src/pages/standard/StartDato/StartDato';
import { Medlemskap } from '../../src/pages/standard/Medlemskap/Medlemskap';
import { Yrkesskade } from '../../src/pages/standard/Yrkesskade/Yrkesskade';
import { Behandlere } from '../../src/pages/standard/Behandlere/Behandlere';
import { Barnetillegg } from '../../src/pages/standard/Barnetillegg/Barnetillegg';
import Student from '../../src/pages/standard/Student/Student';
import { AndreUtbetalinger } from '../../src/pages/standard/AndreUtbetalinger/AndreUtbetalinger';
import Tilleggsopplysninger from '../../src/pages/standard/Tilleggsopplysninger/Tilleggsopplysninger';
import Vedlegg from '../../src/pages/standard/Vedlegg/Vedlegg';
import Oppsummering from '../../src/pages/standard/Oppsummering/Oppsummering';

const Steps = () => {
  const router = useRouter();

  const { step } = router.query;

  console.log('router.query', step);

  const { formatMessage } = useFeatureToggleIntl();

  const [oppslagLoading, setOppslagLoading] = useState<boolean>(true);
  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { oppslagDispatch, søker, fastlege } = useSokerOppslag();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const pageHeading = useRef(null);
  useEffect(() => {
    const getSoknadStateAndOppslag = async () => {
      // Wait to test cache
      const cachedState = await hentSoknadState<Soknad>(søknadDispatch, SøknadType.STANDARD);
      if (cachedState?.lagretStepList && cachedState?.lagretStepList?.length > 0) {
        setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      } else {
        setStepList([...defaultStepList], stepWizardDispatch);
      }
      const oppslag = await hentSokerOppslag(oppslagDispatch);
      setOppslagLoading(false);
      if (oppslag?.søker?.barn) addBarnIfMissing(søknadDispatch, oppslag.søker.barn);
    };
    getSoknadStateAndOppslag();
  }, []);

  useEffect(() => {
    if (søknadState?.søknad && Object.keys(søknadState?.søknad)?.length > 0) {
      debouncedLagre(søknadState, stepList, {});
    }
  }, [currentStep, stepList]);
  useEffect(() => {
    window && window.scrollTo(0, 0);
    if (pageHeading?.current != null) (pageHeading?.current as HTMLElement)?.focus();
  }, [currentStep]);

  const submitSoknad: SubmitHandler<Soknad> = async (data) => {
    if (currentStep?.name === StepNames.OPPSUMMERING) {
      console.log('post søknad', søknadState?.søknad);

      // Må massere dataene litt før vi sender de inn
      const søknad = mapSøknadToBackend(søknadState?.søknad);

      console.log('søknad', søknad);

      const postResponse = await postSøknad(søknad);
      if (postResponse?.ok) {
        router.push('kvittering');
      } else {
        // show post error
      }
      setTimeout(() => {
        router.push('kvittering');
      }, 2000);
    } else {
      completeAndGoToNextStep(stepWizardDispatch);
    }
  };
  const postSøknad = async (data?: any) =>
    fetchPOST('/aap/soknad-api/innsending/soknad', {
      ...data,
    });
  const onPreviousStep = () => {
    if (currentStep?.name === StepNames.STARTDATO) {
      router.push('/standard');
    } else {
      goToPreviousStep(stepWizardDispatch);
      // @ts-ignore-line
      router.push(`/standard/${Number.parseInt(step) - 1}`);
    }
  };

  return (
    <>
      <header>
        <PageHeader align="center">{formatMessage('søknad.pagetitle')}</PageHeader>
      </header>
      <StepWizard>
        {step === '1' && (
          <StartDato
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('2');
            }}
          />
        )}
        {step === '2' && (
          <Medlemskap
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('3');
            }}
          />
        )}
        {step === '3' && (
          <Yrkesskade
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('4');
            }}
          />
        )}
        {step === '4' && (
          <Behandlere
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('5');
            }}
            fastlege={fastlege}
          />
        )}
        {step === '5' && (
          <Barnetillegg
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('6');
            }}
          />
        )}
        {step === '6' && (
          <Student
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('7');
            }}
          />
        )}
        {step === '7' && (
          <AndreUtbetalinger
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('8');
            }}
          />
        )}
        {step === '8' && (
          <Tilleggsopplysninger
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('9');
            }}
          />
        )}
        {step === '9' && (
          <Vedlegg
            onBackClick={onPreviousStep}
            onNext={(data) => {
              updateSøknadData<Soknad>(søknadDispatch, data);
              completeAndGoToNextStep(stepWizardDispatch);
              router.push('10');
            }}
          />
        )}
        {step === '10' && (
          <Oppsummering onBackClick={onPreviousStep} onSubmitSoknad={submitSoknad} />
        )}
      </StepWizard>
    </>
  );
};

const StepsWithContextProvider = () => (
  <SoknadContextProviderStandard>
    <Steps />
  </SoknadContextProviderStandard>
);

export default StepsWithContextProvider;
