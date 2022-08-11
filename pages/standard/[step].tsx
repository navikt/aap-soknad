import { PageHeader } from '@navikt/ds-react';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { setSoknadStateFraProps, SoknadActionKeys } from '../../src/context/soknadContextCommon';
import {
  useStepWizard,
  setStepList,
  completeAndGoToNextStep,
  goToPreviousStep,
} from '../../src/context/stepWizardContextV2';
import { useFeatureToggleIntl } from '../../src/hooks/useFeatureToggleIntl';
import { GenericSoknadContextState } from '../../src/types/SoknadContext';
import { useDebounceLagreSoknad } from '../../src/hooks/useDebounceLagreSoknad';
import { StepWizard } from '../../src/components/StepWizard';
import {
  SoknadContextProviderStandard,
  useSoknadContextStandard,
  addBarnIfMissing,
} from '../../src/context/soknadContextStandard';
import {
  setSokerOppslagFraProps,
  SokerOppslagState,
  useSokerOppslag,
} from '../../src/context/sokerOppslagContext';
import { updateSøknadData } from '../../src/context/soknadContextCommon';
import Soknad from '../../src/types/Soknad';
import { SubmitHandler } from 'react-hook-form';
import { fetchPOST } from '../../src/api/fetch';
import { mapSøknadToBackend, StepNames } from '../../src/pages/standard';
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
import { beskyttetSide } from '../../auth/beskyttetSide';
import { GetServerSidePropsResult, NextPageContext } from 'next';
import { getAccessToken } from '../../auth/accessToken';
import { getSøker } from '../api/oppslag/soeker';
import { lesBucket } from '../api/buckets/les';

interface PageProps {
  søker: SokerOppslagState;
  mellomlagretSøknad: GenericSoknadContextState<Soknad>;
}

const Steps = ({ søker, mellomlagretSøknad }: PageProps) => {
  const router = useRouter();
  const { step } = router.query;

  const { formatMessage } = useFeatureToggleIntl();

  const { søknadState, søknadDispatch } = useSoknadContextStandard();
  const { oppslagDispatch, fastlege } = useSokerOppslag();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();

  useEffect(() => {
    if (søknadState?.søknad === undefined) {
      setSoknadStateFraProps(mellomlagretSøknad, søknadDispatch);
      if (mellomlagretSøknad.lagretStepList && mellomlagretSøknad?.lagretStepList?.length > 0) {
        setStepList([...mellomlagretSøknad.lagretStepList], stepWizardDispatch);
      }
      const oppslag = setSokerOppslagFraProps(søker, oppslagDispatch);
      if (oppslag?.søker?.barn) addBarnIfMissing(søknadDispatch, oppslag.søker.barn);
    }
  }, []);

  useEffect(() => {
    if (søknadState?.søknad && Object.keys(søknadState?.søknad)?.length > 0) {
      debouncedLagre(søknadState, stepList, {});
    }
  }, [currentStep, stepList]);

  useEffect(() => {
    if (currentStep && currentStep.stepIndex !== undefined) {
      router.push(currentStep.stepIndex.toString());
    }
  }, [currentStep]);

  const submitSoknad: SubmitHandler<Soknad> = async (data) => {
    if (currentStep?.name === StepNames.OPPSUMMERING) {
      console.log('post søknad', søknadState?.søknad);

      // Må massere dataene litt før vi sender de inn
      const søknad = mapSøknadToBackend(søknadState?.søknad);

      console.log('søknad', søknad);

      const postResponse = await postSøknad(søknad);
      if (postResponse?.ok) {
        const url = postResponse?.data?.uri;
        søknadDispatch({ type: SoknadActionKeys.ADD_SØKNAD_URL, payload: url });
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
    fetchPOST('/aap/soknad/api/innsending/soknad', {
      ...data,
    });

  const onPreviousStep = async () => {
    if (currentStep?.name === StepNames.STARTDATO) {
      router.push('/standard');
    } else {
      goToPreviousStep(stepWizardDispatch);
    }
  };

  const onNextStep = async (data: any) => {
    updateSøknadData<Soknad>(søknadDispatch, data);
    completeAndGoToNextStep(stepWizardDispatch);
  };

  return (
    <>
      <header>
        <PageHeader align="center">{formatMessage('søknad.pagetitle')}</PageHeader>
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
              fastlege={fastlege}
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
            <Oppsummering onBackClick={onPreviousStep} onSubmitSoknad={submitSoknad} />
          )}
        </StepWizard>
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
    const { step } = ctx.query;
    const bearerToken = getAccessToken(ctx);
    const søker = await getSøker(bearerToken);
    const mellomlagretSøknad = await lesBucket('STANDARD', bearerToken);

    if (!mellomlagretSøknad.lagretStepList) {
      return {
        redirect: {
          destination: '/standard',
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
