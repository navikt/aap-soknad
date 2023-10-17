import PageHeader from 'components/PageHeader';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { setSoknadStateFraProps, SoknadActionKeys } from 'context/soknadContextCommon';
import {
  completeAndGoToNextStep,
  goToPreviousStep,
  setStepList,
  useStepWizard,
} from 'context/stepWizardContextV2';
import { GenericSoknadContextState } from 'types/SoknadContext';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { StepWizard } from 'components/StepWizard';
import {
  addBarnIfMissing,
  addBehandlerIfMissing,
  SoknadContextProviderStandard,
  useSoknadContextStandard,
} from 'context/soknadContextStandard';
import {
  setSokerOppslagFraProps,
  SokerOppslagState,
  useSokerOppslag,
} from 'context/sokerOppslagContext';
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
import { AndreUtbetalinger } from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import Vedlegg from 'components/pageComponents/standard/Vedlegg/Vedlegg';
import Oppsummering from 'components/pageComponents/standard/Oppsummering/Oppsummering';
import { beskyttetSide } from 'auth/beskyttetSide';
import { GetServerSidePropsResult, NextPageContext } from 'next';
import { getAccessToken } from 'auth/accessToken';
import { getSøker } from './api/oppslag/soeker';
import { lesBucket } from './api/buckets/les';
import { logSkjemaFullførtEvent, logVeiledningVistEvent } from 'utils/amplitude';
import metrics from 'utils/metrics';
import { scrollRefIntoView } from 'utils/dom';
import { Steg0 } from 'components/pageComponents/standard/Steg0/Steg0';
import * as classes from './step.module.css';
import { FormattedMessage, useIntl } from 'react-intl';
import { logger } from '@navikt/aap-felles-utils';

interface PageProps {
  søker: SokerOppslagState;
  mellomlagretSøknad: GenericSoknadContextState<Soknad>;
}

const Steps = ({ søker, mellomlagretSøknad }: PageProps) => {
  const router = useRouter();
  const { step } = router.query;

  const { formatMessage } = useIntl();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { oppslagDispatch } = useSokerOppslag();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

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
      router.push(currentStep.stepIndex.toString(), currentStep.stepIndex.toString(), {
        scroll: true,
        shallow: true,
      });
    }
  }, [currentStep]);

  useEffect(() => {
    if (showFetchErrorMessage) {
      if (submitErrorMessageRef?.current != null) scrollRefIntoView(submitErrorMessageRef);
    }
  }, [showFetchErrorMessage]);

  const submitSoknad: SubmitHandler<Soknad> = async () => {
    if (currentStep?.name === StepNames.OPPSUMMERING) {
      setShowFetchErrorMessage(false);
      const sendtTimestamp = new Date();

      // Må massere dataene litt før vi sender de inn
      const søknad = mapSøknadToBackend(søknadState?.søknad);

      const søknadPdf = mapSøknadToPdf(
        søknadState?.søknad,
        sendtTimestamp,
        formatMessage,
        søknadState?.requiredVedlegg
      );

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
        return true;
      } else {
        setShowFetchErrorMessage(true);
      }
    } else {
      completeAndGoToNextStep(stepWizardDispatch);
    }
    return false;
  };
  const postSøknad = async (data?: any) =>
    fetchPOST('/aap/soknad/api/innsending/soknad', {
      ...data,
    });

  const onPreviousStep = async () => {
    goToPreviousStep(stepWizardDispatch);
  };

  return (
    <>
      <header>
        <PageHeader align="center">
          <FormattedMessage
            id={'søknad.pagetitle'}
            values={{
              wbr: () => <>&shy;</>,
            }}
          />
        </PageHeader>
      </header>
      {søknadState?.søknad && (
        <main className={classes?.main}>
          {step === '0' ? (
            <Steg0
              søker={søker}
              onNext={() => {
                router.push('1', undefined, { scroll: true });
              }}
            />
          ) : (
            <StepWizard>
              {step === '1' && (
                <StartDato
                  onBackClick={() => {
                    logVeiledningVistEvent();
                    router.push('0');
                  }}
                />
              )}
              {step === '2' && <Medlemskap onBackClick={onPreviousStep} />}
              {step === '3' && <Yrkesskade onBackClick={onPreviousStep} />}
              {step === '4' && <Behandlere onBackClick={onPreviousStep} />}
              {step === '5' && <Barnetillegg onBackClick={onPreviousStep} />}
              {step === '6' && <Student onBackClick={onPreviousStep} />}
              {step === '7' && <AndreUtbetalinger onBackClick={onPreviousStep} />}
              {step === '8' && <Vedlegg onBackClick={onPreviousStep} />}
              {step === '9' && (
                <Oppsummering
                  onBackClick={onPreviousStep}
                  // @ts-ignore-line TODO: grave i denne
                  onSubmitSoknad={submitSoknad}
                  submitErrorMessageRef={submitErrorMessageRef}
                  hasSubmitError={showFetchErrorMessage}
                />
              )}
            </StepWizard>
          )}
        </main>
      )}
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
    const bearerToken = getAccessToken(ctx);
    const søker = await getSøker(bearerToken);
    const mellomlagretSøknad = await lesBucket('STANDARD', bearerToken);

    stopTimer();

    if (mellomlagretSøknad && !mellomlagretSøknad.lagretStepList) {
      logger.error('Mellomlagret søknad finnes, men mangler stepList');
    }

    if (!mellomlagretSøknad?.lagretStepList) {
      logger.warn('lagretStepList mangler i mellomlagret søknad, redirecter til startsiden');
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
