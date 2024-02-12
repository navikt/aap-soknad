import PageHeader from 'components/PageHeader';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { completeAndGoToNextStep, goToPreviousStep, setStepList } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { StepWizard } from 'components/StepWizard';
import {
  KontaktInfoView,
  setSokerOppslagFraProps,
  SokerOppslagState,
  useSokerOppslag,
} from 'context/sokerOppslagContext';
import { Soknad } from 'types/Soknad';
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
import { SoknadContextProvider, SoknadContextState } from 'context/soknadcontext/soknadContext';
import { useSoknad } from 'hooks/SoknadHook';
import {
  addBarnIfMissing,
  addBehandlerIfMissing,
  setSoknadStateFraProps,
  SoknadActionKeys,
} from 'context/soknadcontext/actions';
import { getKrr } from 'pages/api/oppslag/krr';
import { Barn, getBarn } from 'pages/api/oppslag/barn';
import { formatNavn } from 'utils/StringFormatters';
import { hentMellomlagring } from 'pages/api/mellomlagring/les';
import { RequiredVedlegg } from 'types/SoknadContext';

interface PageProps {
  søker: SokerOppslagState;
  mellomlagretSøknad: SoknadContextState;
  kontaktinformasjon: KontaktInfoView | null;
  barn: Barn[];
}

const Steps = ({ søker, mellomlagretSøknad, kontaktinformasjon, barn }: PageProps) => {
  const router = useRouter();
  const { step } = router.query;

  const { formatMessage } = useIntl();

  const { søknadState, søknadDispatch } = useSoknad();
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
      setSokerOppslagFraProps(søker, oppslagDispatch);

      if (barn) addBarnIfMissing(søknadDispatch, barn);
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

  const submitSoknad = async () => {
    if (currentStep?.name === StepNames.OPPSUMMERING) {
      setShowFetchErrorMessage(false);
      const sendtTimestamp = new Date();

      // Må massere dataene litt før vi sender de inn
      const søknad = mapSøknadToBackend(søknadState?.søknad);

      const søknadPdf = mapSøknadToPdf(
        søknadState?.søknad,
        sendtTimestamp,
        formatMessage,
        søknadState?.requiredVedlegg,
      );

      const postResponse = søknadState.brukerMellomLagretSøknadFraAApInnsending
        ? await postSøknadMedAAPInnsending(søknadState.søknad, søknadState.requiredVedlegg)
        : await postSøknadMedSoknadApi({ søknad, kvittering: søknadPdf });

      if (postResponse?.ok) {
        const harVedlegg = søknadState.requiredVedlegg && søknadState?.requiredVedlegg?.length > 0;
        const erIkkeKomplett = !!søknadState?.requiredVedlegg?.find(
          (vedlegg) => !vedlegg.completed,
        );
        const brukerFritekstfelt =
          søknadState?.søknad?.tilleggsopplysninger !== undefined &&
          søknadState?.søknad?.tilleggsopplysninger.length > 0;
        logSkjemaFullførtEvent({ harVedlegg, erIkkeKomplett, brukerFritekstfelt });

        if (!søknadState.brukerMellomLagretSøknadFraAApInnsending) {
          const url = postResponse?.data?.uri;
          søknadDispatch({ type: SoknadActionKeys.ADD_SØKNAD_URL, payload: url });
        }
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
  const postSøknadMedSoknadApi = async (data?: any) =>
    fetchPOST('/aap/soknad/api/innsending/soknadapi', {
      ...data,
    });

  const postSøknadMedAAPInnsending = async (søknad?: Soknad, requiredVedlegg?: RequiredVedlegg[]) =>
    fetchPOST('/aap/soknad/api/innsending/soknadinnsending/', {
      søknad,
      requiredVedlegg,
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
                  onSubmitSoknad={submitSoknad}
                  submitErrorMessageRef={submitErrorMessageRef}
                  hasSubmitError={showFetchErrorMessage}
                  kontaktinformasjon={kontaktinformasjon}
                />
              )}
            </StepWizard>
          )}
        </main>
      )}
    </>
  );
};

const StepsWithContextProvider = (props: PageProps) => (
  <SoknadContextProvider>
    <Steps {...props} />
  </SoknadContextProvider>
);

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<PageProps>> => {
    const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({
      path: '/[steg]',
    });
    const bearerToken = getAccessToken(ctx);
    const søker = await getSøker(bearerToken);
    let kontaktinformasjon = null;
    try {
      kontaktinformasjon = await getKrr(bearerToken);
    } catch (e) {
      logger.error({ message: `Noe gikk galt i kallet mot oppslag/krr: ${e?.toString()}` });
    }

    let mellomlagretSøknad: SoknadContextState | undefined;

    try {
      const [mellomlagretSøknadFraSoknadApi, mellomlagretSøknadFraAapInnsending] =
        await Promise.all([lesBucket('STANDARD', bearerToken), hentMellomlagring(bearerToken)]);

      if (mellomlagretSøknadFraAapInnsending && !mellomlagretSøknadFraSoknadApi) {
        mellomlagretSøknad = {
          ...mellomlagretSøknadFraAapInnsending,
          brukerMellomLagretSøknadFraAApInnsending: true,
        };
      } else if (mellomlagretSøknadFraSoknadApi && !mellomlagretSøknadFraAapInnsending) {
        mellomlagretSøknad = {
          ...mellomlagretSøknadFraSoknadApi,
          brukerMellomLagretSøknadFraAApInnsending: false,
        };
      }
    } catch (e) {
      logger.error('Noe gikk galt i innhenting av mellomlagret søknad', e);
    }

    let barn: Barn[] = søker?.søker?.barn?.map((barn) => {
      return { navn: formatNavn(barn.navn), fødselsdato: barn.fødselsdato };
    });

    try {
      barn = await getBarn(bearerToken);
    } catch (e) {
      logger.error('Noe gikk galt i kallet mot barn fra aap-oppslag', e);
    }

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
      props: { søker, mellomlagretSøknad, kontaktinformasjon, barn },
    };
  },
);

export default StepsWithContextProvider;
