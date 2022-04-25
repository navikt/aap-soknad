import React, { useEffect, useState } from 'react';
import { useTexts } from '../../hooks/useTexts';
import { PageHeader } from '@navikt/ds-react';
import * as tekster from './tekster';
import { Step, StepWizard } from '../../components/StepWizard';
import { SubmitHandler } from 'react-hook-form';
import {
  completeAndGoToNextStep,
  useStepWizard,
  resetStepWizard,
  goToPreviousStep,
} from '../../context/stepWizardContextV2';
import Soknad from '../../types/Soknad';
import {
  useSoknadContext,
  slettLagretSoknadState,
  addBarnIfMissing,
} from '../../context/soknadContext';
import { Veiledning } from './Veiledning/Veiledning';
import { hentSokerOppslag, useSokerOppslag } from '../../context/sokerOppslagContext';
import { Behandlere } from './Behandlere/Behandlere';
import { Medlemskap } from './Medlemskap/Medlemskap';
import { Yrkesskade } from './Yrkesskade/Yrkesskade';
import { AndreUtbetalinger } from './AndreUtbetalinger/AndreUtbetalinger';
import { Barnetillegg } from './Barnetillegg/Barnetillegg';
import Oppsummering from './Oppsummering/Oppsummering';
import Tilleggsopplysninger from './Tilleggsopplysninger/Tilleggsopplysninger';
import Vedlegg from '../Vedlegg/Vedlegg';
import StartDato from './StartDato/StartDato';
import Student from './Student/Student';
import Kvittering from './Kvittering/Kvittering';
import { fetchPOST } from '../../api/fetch';
import * as classes from './standard.module.css';
export enum StepNames {
  VEILEDNING = 'VEILEDNING',
  STARTDATO = 'STARTDATO',
  FASTLEGE = 'FASTLEGE',
  MEDLEMSKAP = 'MEDLEMSKAP',
  YRKESSKADE = 'YRKESSKADE',
  STUDENT = 'STUDENT',
  ANDRE_UTBETALINGER = 'ANDRE_UTBETALINGER',
  BARNETILLEGG = 'BARNETILLEGG',
  VEDLEGG = 'VEDLEGG',
  TILLEGGSOPPLYSNINGER = 'TILLEGGSOPPLYSNINGER',
  OPPSUMMERING = 'OPPSUMMERING',
}

export const StandardPage = (): JSX.Element => {
  const [oppslagLoading, setOppslagLoading] = useState<boolean>(true);
  const [showVeiledning, setShowVeiledning] = useState<boolean>(true);
  const [showKvittering, setShowKvittering] = useState<boolean>(false);
  const { søknadState, søknadDispatch } = useSoknadContext();
  const { oppslagDispatch, søker, fastlege } = useSokerOppslag();
  const { currentStep, stepWizardDispatch } = useStepWizard();
  const { getText } = useTexts(tekster);
  useEffect(() => {
    const getSoknadStateAndOppslag = async () => {
      // Wait to test cache
      // const cachedState = await hentSoknadState(søknadDispatch, SøknadType.HOVED);
      // if (cachedState?.lagretStepList) {
      //   setStepList([...cachedState.lagretStepList], stepWizardDispatch);
      // }
      const oppslag = await hentSokerOppslag(oppslagDispatch);
      setOppslagLoading(false);
      if (oppslag?.søker?.barn) addBarnIfMissing(søknadDispatch, oppslag.søker.barn);
    };
    getSoknadStateAndOppslag();
  }, []);
  const submitSoknad: SubmitHandler<Soknad> = async (data) => {
    if (currentStep?.name === StepNames.OPPSUMMERING) {
      // const postResponse = await postSøknad(søknadState?.søknad);
      // if (postResponse?.ok) {
      //   setShowKvittering(true);
      // } else {
      //   // show post error
      // }
      setTimeout(() => {
        setShowKvittering(true);
      }, 2000);
    } else {
      completeAndGoToNextStep(stepWizardDispatch);
    }
  };
  const postSøknad = async (data?: Soknad) =>
    fetchPOST('/aap/soknad-api/innsending/standard', {
      ...data,
    });
  const onPreviousStep = () => {
    if (currentStep?.name === StepNames.STARTDATO) {
      setShowVeiledning(true);
    } else {
      goToPreviousStep(stepWizardDispatch);
    }
  };
  const onDeleteSøknad = async () => {
    if (søknadState.type) {
      const deleteRes = await slettLagretSoknadState(søknadDispatch, søknadState.type);
      if (deleteRes) {
        resetStepWizard(stepWizardDispatch);
      } else {
        console.error('noe gikk galt med sletting av lagret søknad');
      }
    }
  };
  if (showKvittering)
    return (
      <>
        <PageHeader align="center" className={classes?.pageHeader}>
          {getText('pagetitle')}
        </PageHeader>
        <Kvittering getText={getText} søker={søker} />
      </>
    );
  if (showVeiledning)
    return (
      <Veiledning
        onSubmit={() => setShowVeiledning(false)}
        getText={getText}
        søker={søker}
        loading={oppslagLoading}
      />
    );
  return (
    <>
      <PageHeader align="center">{getText('pagetitle')}</PageHeader>
      <StepWizard hideLabels={true}>
        <Step order={1} name={StepNames.STARTDATO} label={'Søknadsdato'}>
          <StartDato
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={2} name={StepNames.MEDLEMSKAP} label={'Tilknytning til Norge'}>
          <Medlemskap
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={3} name={StepNames.YRKESSKADE} label={'Yrkesskade'}>
          <Yrkesskade
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={4} name={StepNames.ANDRE_UTBETALINGER} label={'Andre utbetalinger'}>
          <AndreUtbetalinger
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={5} name={StepNames.FASTLEGE} label={'Fastlege'}>
          <Behandlere
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
            fastlege={fastlege}
          />
        </Step>
        <Step order={6} name={StepNames.BARNETILLEGG} label={'Barnetilleggg'}>
          <Barnetillegg
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={7} name={StepNames.STUDENT} label={'Student'}>
          <Student
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={8} name={StepNames.TILLEGGSOPPLYSNINGER} label={'Tilleggsopplysninger'}>
          <Tilleggsopplysninger
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={9} name={StepNames.VEDLEGG} label={'Vedlegg'}>
          <Vedlegg
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            søknad={søknadState?.søknad}
          />
        </Step>
        <Step order={10} name={StepNames.OPPSUMMERING} label={'Oppsummering'}>
          <Oppsummering
            getText={getText}
            onCancelClick={onDeleteSøknad}
            onBackClick={onPreviousStep}
            onSubmitSoknad={submitSoknad}
          />
        </Step>
      </StepWizard>
    </>
  );
};

export default StandardPage;
