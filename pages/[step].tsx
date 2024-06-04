import PageHeader from 'components/PageHeader';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { completeAndGoToNextStep, goToPreviousStep, setStepList } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { StepWizard } from 'components/StepWizard';
import { Soknad, SoknadVedlegg } from 'types/Soknad';
import { fetchPOST } from 'api/fetch';
import { StepNames } from './index';
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
import { logSkjemaFullførtEvent, logVeiledningVistEvent } from 'utils/amplitude';
import metrics from 'utils/metrics';
import { scrollRefIntoView } from 'utils/dom';
import { Steg0 } from 'components/pageComponents/standard/Steg0/Steg0';
import * as classes from './step.module.css';
import { FormattedMessage, useIntl } from 'react-intl';
import { SoknadContextProvider, SoknadContextState } from 'context/soknadcontext/soknadContext';
import { useSoknad } from 'hooks/SoknadHook';
import {
  addBarnIfMissing,
  addFastlegeIfMissing,
  deleteVedlegg,
  setSoknadStateFraProps,
} from 'context/soknadcontext/actions';
import { getKrr, KrrKontaktInfo } from 'pages/api/oppslag/krr';
import { Barn, getBarn } from 'pages/api/oppslag/barn';
import { hentMellomlagring } from 'pages/api/mellomlagring/les';
import { RequiredVedlegg } from 'types/SoknadContext';
import { logError, logInfo, logWarning } from '@navikt/aap-felles-utils';
import { parse } from 'date-fns';
import { Fastlege, getFastlege } from 'pages/api/oppslag/fastlege';
import { migrerMellomlagretBehandler } from 'lib/utils/migrerMellomlagretBehandler';
import { getPerson, Person } from 'pages/api/oppslagapi/person';
import { SoknadUtenVedleggModal } from 'components/pageComponents/standard/Oppsummering/SoknadUtenVedleggModal';
import { isDev, isMock } from 'utils/environments';

interface PageProps {
  mellomlagretSøknad: SoknadContextState;
  kontaktinformasjon: KrrKontaktInfo | null;
  person: Person;
  barn: Barn[];
  fastlege: Fastlege[];
}

const Steps = ({ person, mellomlagretSøknad, kontaktinformasjon, barn, fastlege }: PageProps) => {
  const router = useRouter();
  const { step } = router.query;

  const { søknadState, søknadDispatch } = useSoknad();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  const [showFetchErrorMessage, setShowFetchErrorMessage] = useState(false);
  const [showVedleggErrorMessage, setShowVedleggErrorMessage] = useState(false);
  const submitErrorMessageRef = useRef(null);

  useEffect(() => {
    if (søknadState?.søknad === undefined) {
      setSoknadStateFraProps(mellomlagretSøknad, søknadDispatch);
      if (mellomlagretSøknad.lagretStepList && mellomlagretSøknad?.lagretStepList?.length > 0) {
        setStepList([...mellomlagretSøknad.lagretStepList], stepWizardDispatch);
      }

      if (barn) addBarnIfMissing(søknadDispatch, barn);
      if (fastlege) addFastlegeIfMissing(søknadDispatch, fastlege);
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
      setShowVedleggErrorMessage(false);

      const postResponse = await postSøknadMedAAPInnsending(
        søknadState.søknad,
        søknadState.requiredVedlegg,
      );

      if (postResponse?.ok) {
        const harVedlegg = søknadState.requiredVedlegg && søknadState?.requiredVedlegg?.length > 0;
        const erIkkeKomplett = !!søknadState?.requiredVedlegg?.find(
          (vedlegg) => !vedlegg.completed,
        );
        const yrkesskade = søknadState?.søknad?.yrkesskade;
        const brukerFritekstfelt =
          søknadState?.søknad?.tilleggsopplysninger !== undefined &&
          søknadState?.søknad?.tilleggsopplysninger.length > 0;
        logSkjemaFullførtEvent({ harVedlegg, erIkkeKomplett, brukerFritekstfelt, yrkesskade });

        router.push('kvittering');
        return true;
      } else if (postResponse?.status === 412) {
        setShowVedleggErrorMessage(true);
      } else {
        setShowFetchErrorMessage(true);
      }
    } else {
      completeAndGoToNextStep(stepWizardDispatch);
    }
    return false;
  };

  const removeAllVedleggFromSoknadAndSubmit = async () => {
    const alleVedlegg = søknadState?.søknad?.vedlegg;
    Object.keys(alleVedlegg ?? {}).forEach((key) => {
      const vedlegg = alleVedlegg?.[key];
      vedlegg?.forEach((vedlegg) => {
        deleteVedlegg(søknadDispatch, vedlegg, key);
      });
    });
    await submitSoknad();
  };

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
              person={person}
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
                  person={person}
                />
              )}
            </StepWizard>
          )}
          <SoknadUtenVedleggModal
            showModal={showVedleggErrorMessage}
            onSendSoknad={async () => {
              await removeAllVedleggFromSoknadAndSubmit();
              setShowVedleggErrorMessage(false);
            }}
            onClose={() => {
              setShowVedleggErrorMessage(false);
            }}
          />
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

const hentFastlege = async (bearerToken?: string) => {
  try {
    return await getFastlege(bearerToken);
  } catch (e) {
    logError('Noe gikk galt i kallet mot oppslag/fastlege', e);
    return [];
  }
};

export const getServerSideProps = beskyttetSide(
  async (ctx: NextPageContext): Promise<GetServerSidePropsResult<PageProps>> => {
    const stopTimer = metrics.getServersidePropsDurationHistogram.startTimer({
      path: '/[steg]',
    });
    const bearerToken = getAccessToken(ctx);
    const person = await getPerson(ctx.req);
    let kontaktinformasjon: KrrKontaktInfo | null = null;
    try {
      kontaktinformasjon = await getKrr(bearerToken);
    } catch (e) {
      logError(`Noe gikk galt i kallet mot oppslag/krr`, e);
    }

    const fastlege = await hentFastlege(bearerToken);

    let mellomlagretSøknad: SoknadContextState | undefined;
    try {
      mellomlagretSøknad = await hentMellomlagring(ctx.req);
    } catch (e) {
      logError('Noe gikk galt i innhenting av mellomlagret søknad', e);
    }

    if (mellomlagretSøknad) {
      mellomlagretSøknad = migrerMellomlagretBehandler(mellomlagretSøknad);
    }

    if ((isDev() || isMock()) && mellomlagretSøknad) {
      mellomlagretSøknad = {
        ...mellomlagretSøknad,
        søknad: {
          ...mellomlagretSøknad?.søknad,
          vedlegg: {
            ...mellomlagretSøknad?.søknad?.vedlegg,
            ANNET: [{ vedleggId: '1', name: 'test.pdf', size: 2, type: 'application/pdf' }],
          },
        },
      };
    }

    let barn: Barn[] = [];
    try {
      barn = await getBarn(bearerToken);
      barn.sort((barnA, barnB) => {
        const a = parse(barnA.fødselsdato, 'yyyy-MM-dd', new Date() as any);
        const b = parse(barnB.fødselsdato, 'yyyy-MM-dd', new Date() as any);
        return a - b;
      });
    } catch (e) {
      logError('Noe gikk galt i kallet mot barn fra aap-oppslag', e);
    }

    stopTimer();

    if (mellomlagretSøknad && !mellomlagretSøknad.lagretStepList) {
      logError('Mellomlagret søknad finnes, men mangler stepList');
    }

    if (!mellomlagretSøknad?.lagretStepList) {
      logWarning('lagretStepList mangler i mellomlagret søknad, redirecter til startsiden');
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: { person, mellomlagretSøknad, kontaktinformasjon, barn, fastlege },
    };
  },
);

export default StepsWithContextProvider;
