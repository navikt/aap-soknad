import PageHeader from 'components/PageHeader';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { setSoknadStateFraProps, SoknadActionKeys } from 'context/soknadContextCommon';
import {
  useStepWizard,
  setStepList,
  completeAndGoToNextStep,
  goToPreviousStep,
} from 'context/stepWizardContextV2';
import { useFeatureToggleIntl } from 'hooks/useFeatureToggleIntl';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { StepWizard } from 'components/StepWizard';
import {
  SoknadContextProviderStandard,
  useSoknadContextStandard,
  addBarnIfMissing,
  addBehandlerIfMissing,
} from 'context/soknadContextStandard';
import {
  setSokerOppslagFraProps,
  SokerOppslagState,
  useSokerOppslag,
} from 'context/sokerOppslagContext';
import { updateSøknadData } from 'context/soknadContextCommon';
import { Soknad } from 'types/Soknad';
import { SubmitHandler } from 'react-hook-form';
import { fetchPOST } from 'api/fetch';
import { StepNames } from './index';
import { mapSøknadToBackend, mapSøknadToPdf } from 'utils/api';
import StartDato from 'components/pageComponents/standard/StartDato/StartDato';
import { Medlemskap } from 'components/pageComponents/standard/Medlemskap/Medlemskap';
import { Yrkesskade } from 'components/pageComponents/standard/Yrkesskade/Yrkesskade';
import { Behandlere } from 'components/pageComponents/standard/Behandlere/Behandlere';
import { Barnetillegg } from 'components/pageComponents/standard/Barnetillegg/Barnetillegg';
import Student from 'components/pageComponents/standard/Student/Student';
import Tilleggsopplysninger from 'components/pageComponents/standard/Tilleggsopplysninger/Tilleggsopplysninger';
import { AndreUtbetalinger } from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import Vedlegg from 'components/pageComponents/standard/Vedlegg/Vedlegg';
import Oppsummering from 'components/pageComponents/standard/Oppsummering/Oppsummering';
import { beskyttetSide } from 'auth/beskyttetSide';
import { GetServerSidePropsResult, NextPageContext } from 'next';
import { getAccessToken } from 'auth/accessToken';
import { getSøker } from './api/oppslag/soeker';
import { lesBucket } from './api/buckets/les';
import { logSkjemaFullførtEvent, logSkjemastegFullførtEvent } from 'utils/amplitude';
import { Alert, Link } from '@navikt/ds-react';
import metrics from 'utils/metrics';
import { scrollRefIntoView } from 'utils/dom';
import { TimeoutBox } from 'components/TimeoutBox/TimeoutBox';

interface PageProps {
  søker: SokerOppslagState;
  mellomlagretSøknad: GenericSoknadContextState<Soknad>;
}

const Steps = ({ søker, mellomlagretSøknad }: PageProps) => {
  const router = useRouter();
  const { step } = router.query;

  const { formatMessage, formatElement } = useFeatureToggleIntl();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { oppslagDispatch } = useSokerOppslag();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>(søknadDispatch);

  const [showFetchErrorMessage, setShowFetchErrorMessage] = useState(false);
  const submitErrorMessageRef = useRef(null);

  useEffect(() => {
    if (søknadState?.søknad === undefined) {
      setSoknadStateFraProps(mellomlagretSøknad, søknadDispatch);
      if (mellomlagretSøknad.lagretStepList && mellomlagretSøknad?.lagretStepList?.length > 0) {
        setStepList([...mellomlagretSøknad.lagretStepList], stepWizardDispatch);
      }
      const oppslag = setSokerOppslagFraProps(søker, oppslagDispatch);
      if (oppslag?.søker?.barn) addBarnIfMissing(søknadDispatch, oppslag.søker.barn);
      if (søker.behandlere) addBehandlerIfMissing(søknadDispatch, søker.behandlere);
    }
  }, []);

  useEffect(() => {
    if (søknadState?.søknad && Object.keys(søknadState?.søknad)?.length > 0) {
      debouncedLagre(søknadState, stepList, {});
    }
  }, [currentStep, stepList]);

  useEffect(() => {
    if (currentStep && currentStep.stepIndex !== undefined) {
      router.push(currentStep.stepIndex.toString(), undefined, { scroll: true, shallow: true });
    }
  }, [currentStep]);

  useEffect(() => {
    if (showFetchErrorMessage) {
      if (submitErrorMessageRef?.current != null) scrollRefIntoView(submitErrorMessageRef);
    }
  }, [showFetchErrorMessage]);

  const submitSoknad: SubmitHandler<Soknad> = async (data) => {
    if (currentStep?.name === StepNames.OPPSUMMERING) {
      setShowFetchErrorMessage(false);
      console.log('post søknad', søknadState);
      const sendtTimestamp = new Date();

      // Må massere dataene litt før vi sender de inn
      const søknad = mapSøknadToBackend(søknadState?.søknad);

      const søknadPdf = mapSøknadToPdf(
        søknadState?.søknad,
        sendtTimestamp,
        formatMessage,
        søknadState?.requiredVedlegg,
        søker?.søker
      );

      console.log('søknad', søknad);
      console.log('søknadPDF', søknadPdf);

      const postResponse = await postSøknad({ søknad, kvittering: søknadPdf });
      if (postResponse?.ok) {
        const harVedlegg = søknadState?.requiredVedlegg?.length > 0;
        const erIkkeKomplett = !!søknadState?.requiredVedlegg?.find(
          (vedlegg) => !vedlegg.completed
        );
        logSkjemaFullførtEvent({ harVedlegg, erIkkeKomplett });
        const url = postResponse?.data?.uri;
        søknadDispatch({ type: SoknadActionKeys.ADD_SØKNAD_URL, payload: url });
        router.push('kvittering');
      } else {
        const navCallid = postResponse?.data?.navCallId;
        setShowFetchErrorMessage(true);
      }
    } else {
      completeAndGoToNextStep(stepWizardDispatch);
    }
  };
  const postSøknad = async (data?: any) =>
    fetchPOST('/aap/soknad/api/innsending/soknad', {
      ...data,
    });

  const onPreviousStep = async () => {
    if (currentStep?.name === StepNames.STARTDATO) {
      router.push('/');
    } else {
      goToPreviousStep(stepWizardDispatch);
    }
  };

  const onNextStep = async (data: any) => {
    logSkjemastegFullførtEvent(currentStep.stepIndex ?? 0);
    updateSøknadData<Soknad>(søknadDispatch, data);
    completeAndGoToNextStep(stepWizardDispatch);
  };

  return (
    <>
      <header>
        <PageHeader align="center">
          {formatElement(`søknad.pagetitle`, {
            wbr: () => <>&shy;</>,
          })}
        </PageHeader>
      </header>
      {søknadState?.søknad && (
        <StepWizard>
          {step === '1' && (
            <StartDato
              onBackClick={onPreviousStep}
              defaultValues={søknadState}
              onNext={(data) => {
                onNextStep(data);
              }}
            />
          )}
          {step === '2' && (
            <Medlemskap
              onBackClick={onPreviousStep}
              defaultValues={søknadState}
              onNext={(data) => {
                onNextStep(data);
              }}
            />
          )}
          {step === '3' && (
            <Yrkesskade
              onBackClick={onPreviousStep}
              defaultValues={søknadState}
              onNext={(data) => {
                onNextStep(data);
              }}
            />
          )}
          {step === '4' && (
            <Behandlere
              onBackClick={onPreviousStep}
              defaultValues={søknadState}
              onNext={(data) => {
                onNextStep(data);
              }}
            />
          )}
          {step === '5' && (
            <Barnetillegg
              onBackClick={onPreviousStep}
              defaultValues={søknadState}
              onNext={(data) => {
                onNextStep(data);
              }}
            />
          )}
          {step === '6' && (
            <Student
              onBackClick={onPreviousStep}
              defaultValues={søknadState}
              onNext={(data) => {
                onNextStep(data);
              }}
            />
          )}
          {step === '7' && (
            <AndreUtbetalinger
              onBackClick={onPreviousStep}
              defaultValues={søknadState}
              onNext={(data) => {
                onNextStep(data);
              }}
            />
          )}
          {step === '8' && (
            <Tilleggsopplysninger
              onBackClick={onPreviousStep}
              defaultValues={søknadState}
              onNext={(data) => {
                onNextStep(data);
              }}
            />
          )}
          {step === '9' && (
            <Vedlegg
              onBackClick={onPreviousStep}
              defaultValues={søknadState}
              onNext={(data) => {
                onNextStep(data);
              }}
            />
          )}
          {step === '10' && (
            <Oppsummering
              onBackClick={onPreviousStep}
              onSubmitSoknad={submitSoknad}
              submitErrorMessageRef={submitErrorMessageRef}
              hasSubmitError={showFetchErrorMessage}
            />
          )}
        </StepWizard>
      )}
      <TimeoutBox logoutTextKey="logoutModal.soknadMessage" />
    </>
  );
};

const StepsWithContextProvider = ({ søker, mellomlagretSøknad }: PageProps) => (
  <SoknadContextProviderStandard>
    <Steps søker={søker} mellomlagretSøknad={mellomlagretSøknad} />
  </SoknadContextProviderStandard>
);

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<{}>> => {
    const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({
      path: '/[steg]',
    });
    const { step } = ctx.query;
    const bearerToken = getAccessToken(ctx);
    const søker = await getSøker(bearerToken);
    const mellomlagretSøknad = await lesBucket('STANDARD', bearerToken);

    stopTimer();
    if (!mellomlagretSøknad?.lagretStepList) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: { søker, mellomlagretSøknad },
    };
  }
);

export default StepsWithContextProvider;
