'use client';

import PageHeader from 'components/PageHeader';
import { useRouter } from 'i18n/routing';
import React, { useEffect, useRef, useState } from 'react';
import { completeAndGoToNextStep, goToPreviousStep, setStepList } from 'context/stepWizardContext';
import { useStepWizard } from 'hooks/StepWizardHook';
import { useDebounceLagreSoknad } from 'hooks/useDebounceLagreSoknad';
import { StepWizard } from 'components/StepWizard';
import { Soknad } from 'types/Soknad';
import { fetchPOST } from 'api/fetch';
import { StepNames, defaultStepList } from 'lib/defaultStepList';
import StartDato from 'components/pageComponents/standard/StartDato/StartDato';
import { Medlemskap } from 'components/pageComponents/standard/Medlemskap/Medlemskap';
import { Yrkesskade } from 'components/pageComponents/standard/Yrkesskade/Yrkesskade';
import { Behandlere } from 'components/pageComponents/standard/Behandlere/Behandlere';
import { Barnetillegg } from 'components/pageComponents/standard/Barnetillegg/Barnetillegg';
import Student from 'components/pageComponents/standard/Student/Student';
import { AndreUtbetalinger } from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import Vedlegg from 'components/pageComponents/standard/Vedlegg/Vedlegg';
import Oppsummering from 'components/pageComponents/standard/Oppsummering/Oppsummering';
import { scrollRefIntoView } from 'utils/dom';
import { Steg0 } from 'components/pageComponents/standard/Steg0/Steg0';
import * as classes from 'styles/step.module.css';
import { useTranslations } from 'next-intl';
import { SoknadContextState } from 'context/soknadcontext/soknadContext';
import { useSoknad } from 'hooks/SoknadHook';
import {
  addBarnIfMissing,
  addFastlegeIfMissing,
  deleteVedlegg,
  setSoknadStateFraProps,
} from 'context/soknadcontext/actions';
import { KrrKontaktInfo } from 'app/api/oppslag/krr/route';
import { Barn } from 'app/api/oppslag/barn/route';
import { Fastlege } from 'app/api/oppslag/fastlege/route';
import { RequiredVedlegg } from 'types/SoknadContext';
import { SoknadUtenVedleggModal } from 'components/pageComponents/standard/Oppsummering/SoknadUtenVedleggModal';
import { Person } from 'app/api/oppslagapi/person/route';

interface StepsPageProps {
  step: string;
  mellomlagretSøknad: SoknadContextState;
  kontaktinformasjon: KrrKontaktInfo | null;
  person: Person;
  barn: Barn[];
  fastlege: Fastlege[];
}

const Steps = ({ step, person, mellomlagretSøknad, kontaktinformasjon, barn, fastlege }: StepsPageProps) => {
  const router = useRouter();
  const { søknadState, søknadDispatch } = useSoknad();
  const { currentStep, stepList, stepWizardDispatch } = useStepWizard();
  const debouncedLagre = useDebounceLagreSoknad<Soknad>();
  const t = useTranslations();

  const [showFetchErrorMessage, setShowFetchErrorMessage] = useState(false);
  const [showVedleggErrorMessage, setShowVedleggErrorMessage] = useState(false);
  const submitErrorMessageRef = useRef(null);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (søknadState?.søknad === undefined) {
      setSoknadStateFraProps(mellomlagretSøknad, søknadDispatch);
      // Only initialize stepList when the wizard context is empty (i.e. first load,
      // not when re-mounting after step navigation where the layout's StepWizardProvider
      // already holds the correct active step).
      if (stepList.length === 0) {
        if (mellomlagretSøknad.lagretStepList && mellomlagretSøknad.lagretStepList.length > 0) {
          setStepList([...mellomlagretSøknad.lagretStepList], stepWizardDispatch);
        } else {
          setStepList(defaultStepList, stepWizardDispatch);
        }
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

  // Navigate to the URL matching the active step. Skip on initial mount — the URL
  // already reflects the correct step. Only fire when currentStep changes due to a
  // user action (next/previous).
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (currentStep && currentStep.stepIndex !== undefined) {
      router.push(`/${currentStep.stepIndex}` as any);
    }
  }, [currentStep]);

  useEffect(() => {
    if (showFetchErrorMessage && submitErrorMessageRef?.current != null) {
      scrollRefIntoView(submitErrorMessageRef);
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
        router.push('/kvittering');
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

  const removeAllVedleggFromSoknadAndSubmit = () => {
    const alleVedlegg = søknadState?.søknad?.vedlegg;
    Object.keys(alleVedlegg ?? {}).forEach((key) => {
      const vedlegg = alleVedlegg?.[key];
      vedlegg?.forEach((v) => {
        deleteVedlegg(søknadDispatch, v, key);
      });
    });
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
          {t.rich('søknad.pagetitle', { wbr: () => <>&shy;</> })}
        </PageHeader>
      </header>
      {søknadState?.søknad && (
        <main className={classes?.main}>
          {step === '0' ? (
            <Steg0
              person={person}
              onNext={() => {
                router.push('/1');
              }}
            />
          ) : (
            <StepWizard>
              {step === '1' && (
                <StartDato
                  onBackClick={() => {
                    router.push('/0');
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
            onSendSoknad={() => {
              removeAllVedleggFromSoknadAndSubmit();
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

export function StepsPage(props: StepsPageProps) {
  return <Steps {...props} />;
}
